// @style "./stylus/ClientFrame.styl"
import {
  brandConnection,
  createMessenger,
  filterConnection,
  logConnection,
  transformConnection,
} from "../messages/mod.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { Server } from "../server/mod.ts";

interface ClientFrameProps {
  clientUrl: string;
  server: Server;
  share: () => Promise<string | null>;
}

export const ClientFrame = observer(
  ({ clientUrl, server, share }: ClientFrameProps) => {
    const lastWindow = React.useRef<Window>();
    const onNewWindow = React.useRef<() => void>();
    return (
      <iframe
        src={clientUrl}
        className="ClientFrame"
        ref={(iframe) => {
          if (!iframe) return;
          const childWindow = iframe.contentWindow!;
          if (childWindow !== lastWindow.current) {
            onNewWindow.current?.();
            lastWindow.current = childWindow;
            const baseConnection = transformConnection(
              filterConnection({
                send: (msg) => childWindow.postMessage(msg, "*"),
                onMsg: (cb) => {
                  window.addEventListener("message", cb);
                  return () => window.removeEventListener("message", cb);
                },
              }, (ev: any): ev is unknown => ev.origin === location.origin),
              (x) => x,
              (ev: any) => ev.data,
            );
            const client = server.addClient(
              logConnection(brandConnection(baseConnection, "client")),
            );
            const shareMessenger = createMessenger<ShareMessengerShape, {}, {}>(
              {
                impl: {
                  share,
                },
                connection: brandConnection(baseConnection, "share"),
              },
            );
            onNewWindow.current = () => {
              client.destroy();
              shareMessenger.destroy();
            };
          }
          // childWindow.addEventListener("mousemove", origEvent => {
          //   console.log("move")
          //   const newEvent = new CustomEvent("mousemove", { bubbles: true, cancelable: true });
          //   const { isTrusted: _, ...origEventRedacted } = origEvent;
          //   Object.assign(newEvent, origEventRedacted);
          //   iframe.dispatchEvent(newEvent)
          // })
        }}
      />
    );
  },
);

export type ShareMessengerShape = {
  share(): Promise<string | null>;
};
