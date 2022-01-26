import "./stylus/ClientFrame.styl";
import {
  brandConnection,
  createMessenger,
  filterConnection,
  logConnection,
  transformConnection,
} from "../messages/mod.ts";
import { server } from "./server.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { clientId, put } from "./swApi.ts";
import { share } from "./code.ts";

const clientUrl = `/${clientId}/index.html`;
await put(
  clientUrl,
  `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>escad</title>
</head>
<body>
  <div id="root">
    <style>#l,#l:before,#l:after{box-sizing:border-box}#root,body{background-color:#151820;width:100vw;height:100vh;margin:0;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center}#l{display:inline-flex;align-items:center;justify-content:center;--size:100px;width:var(--size);height:var(--size);position:absolute}#l:after,#l:before{content:"";display:inline-block;border:calc(var(--size)*.025) solid transparent;border-top-color:#bdc3c7;border-bottom-color:#bdc3c7;border-radius:100%;animation-name:spin;animation-iteration-count:infinite;animation-timing-function:linear;position:absolute}#l:before{animation-duration:2s;width:66.7%;height:66.7%}#l:after{animation-duration:1.333s;animation-direction:reverse;width:44.4%;height:44.4%}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}#L{width:300px}</style>
    <svg id="L" style="width:300px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000"><defs><style>.cls-1{fill:#252830;}.cls-1,.cls-2{stroke:#bdc3c7;stroke-linejoin:round;stroke-width:9px;}.cls-1,.cls-2,.cls-3,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8{stroke-linecap:round;}.cls-2,.cls-3,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8{fill:none;}.cls-3,.cls-6{stroke:#0984e3;}.cls-3,.cls-4,.cls-5,.cls-6,.cls-7,.cls-8{stroke-miterlimit:8.192;stroke-width:12px;}.cls-3,.cls-4,.cls-5{opacity:0.5;isolation:isolate;}.cls-4,.cls-7{stroke:#c0392b;}.cls-5,.cls-8{stroke:#2ecc71;}.cls-9{fill:#bdc3c7;}</style></defs><polygon class="cls-1" points="309.341 1398.352 136.738 502.955 998.471 204.741 1860.205 502.955 1687.602 1398.352 998.471 1995.525 309.341 1398.352"/><polygon class="cls-2" points="1000.919 1571.94 572.728 1247.693 506.018 714.752 1000.919 506.048 1495.819 714.752 1429.109 1247.693 1000.919 1571.94"/><polygon class="cls-2" points="1000.919 560.88 567.565 750.285 620.218 1220.277 1000.919 1500.883 1381.619 1220.277 1434.282 750.285 1000.919 560.88"/><line class="cls-2" x1="506.018" y1="714.752" x2="139.185" y2="502.955"/><line class="cls-2" x1="1000.919" y1="1571.94" x2="1000.919" y2="1995.525"/><line class="cls-2" x1="1495.819" y1="714.752" x2="1862.652" y2="502.955"/><line class="cls-3" x1="1000.919" y1="1001.197" x2="1000.919" y2="1362.589"/><line class="cls-4" x1="1001.535" y1="1000.123" x2="1314.521" y2="819.422"/><line class="cls-5" x1="1000.302" y1="1000.123" x2="687.326" y2="819.422"/><polyline class="cls-6" points="1000.919 1001.197 1000.919 560.88 1000.919 506.048 1000.919 204.741 1000.919 5.975"/><polyline class="cls-7" points="1001.535 1000.123 620.218 1220.277 572.728 1247.693 311.788 1398.352 140.08 1498.346"/><polyline class="cls-8" points="1000.302 1000.123 1381.619 1220.277 1429.109 1247.693 1690.049 1398.352 1861.767 1498.346"/><path class="cls-9" d="M1000.919,1000.482h0m0-11.938a11.938,11.938,0,1,0,11.937,11.938,11.934,11.934,0,0,0-11.937-11.938Z"/></svg>
    <div id="l"/>
  </div>
  <script type="module" src="/${clientId}/client.js"></script>
</body>
</html>
  `.trim(),
);

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
          const client = server.addClient(
            logConnection(brandConnection(baseConnection, "client")),
          );
          const shareMessenger = createMessenger<ShareMessengerShape, {}, {}>({
            impl: {
              share,
            },
            connection: brandConnection(baseConnection, "share"),
          });
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
});

export type ShareMessengerShape = {
  share(): Promise<string | null>;
};
