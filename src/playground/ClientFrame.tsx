/** @jsxImportSource solid */
// @style "./stylus/ClientFrame.styl"
import {
  brandConnection,
  createMessenger,
  filterConnection,
  logConnection,
  transformConnection,
} from "../messaging/mod.ts";
import { createEffect } from "../deps/solid.ts";
import { Server } from "../server/server.ts";

interface ClientFrameProps {
  clientUrl: string;
  server: Server;
  share: () => Promise<string | null>;
}

export const ClientFrame = (props: ClientFrameProps) => {
  let lastWindow: Window | undefined;
  let onNewWindow = () => {};
  const iframe = (
    <iframe
      src={props.clientUrl}
      class="ClientFrame"
      onLoad={foo}
    />
  ) as HTMLIFrameElement;
  function foo() {
    console.log("foo called");
    const childWindow = iframe.contentWindow!;
    if (lastWindow === childWindow) return;
    lastWindow = childWindow;
    onNewWindow();
    const baseConnection = logConnection(
      transformConnection(
        filterConnection({
          send: (msg) => childWindow.postMessage(msg, "*"),
          onMsg: (cb) => {
            window.addEventListener("message", cb);
            return () => window.removeEventListener("message", cb);
          },
        }, (ev: any): ev is unknown => ev.origin === location.origin),
        (x) => x,
        (ev: any) => ev.data,
      ),
      "ClientFrame",
    );
    const client = props.server.addClient(
      logConnection(
        brandConnection(baseConnection, "client"),
        "clientframe client",
      ),
    );
    const shareMessenger = createMessenger<ShareMessengerShape, {}, {}>(
      {
        impl: {
          share: props.share,
        },
        connection: brandConnection(baseConnection, "share"),
      },
    );
    onNewWindow = () => {
      client.destroy();
      shareMessenger.destroy();
    };
  }
  return iframe;
};

export type ShareMessengerShape = {
  share(): Promise<string | null>;
};
