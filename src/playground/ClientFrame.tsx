import "./stylus/ClientFrame.styl";
import {
  brandConnection,
  filterConnection,
  logConnection,
  transformConnection,
} from "../messages/mod.ts";
import { server } from "./server.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { instanceId } from "./instanceId.ts";

const clientUrl = `/vfs/${instanceId}/index.html`;
await fetch(clientUrl, {
  method: "PUT",
  body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>escad</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/vfs/${instanceId}/client.js"></script>
</body>
</html>
  `.trim(),
});

export const ClientFrame = observer(() => {
  const lastWindow = React.useRef<Window>();
  const onNewWindow = React.useRef<() => void>();
  return (
    <iframe
      src={clientUrl}
      className="ClientFrame"
      ref={(iframe) => {
        if (!iframe) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
          const client = server.then((x) =>
            x.addClient(
              logConnection(brandConnection(baseConnection, "client")),
            )
          );
          onNewWindow.current = () => {
            client.then((x) => x.destroy());
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
});
