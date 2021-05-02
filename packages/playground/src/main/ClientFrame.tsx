
import "../../stylus/ClientFrame.styl"
import { brandConnection, createMessenger, filterConnection, transformConnection } from "@escad/messages"
import { createServerClientMessenger } from "@escad/server"
import React, { useState } from "react"
import { createBlob } from "../utils/createBlob"
import { bundlerMessenger, serverEmitter } from "./server"
import { getClientURL } from "../utils/getClientURL"
import { observer } from "rhobo"
import { loadingStatuses } from "./initialize"
import { artifactStore, createRendererWorker } from "./rendererWorker"
import fs from "fs"

export const ClientFrame = observer(() => {
  const [, setState] = useState({})
  const src = getClientURL()
  const lastWindow = React.useRef<Window>()
  const onNewWindow = React.useRef<() => void>()
  if(!src) {
    bundlerMessenger.once("bundle", () => setState({}))
    return <div className="ClientFrame loading">
      Loading...
      {loadingStatuses().map(({ text }, i) =>
        <span key={i}>{text}</span>,
      )}
    </div>
  }
  return <iframe
    src={src}
    onLoad={e => {
      if(e.currentTarget.src !== src)
        e.currentTarget.src = src
    }}
    className="ClientFrame"
    ref={iframe => {
      if(!iframe) return
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childWindow = iframe.contentWindow!
      if(childWindow !== lastWindow.current) {
        onNewWindow.current?.()
        lastWindow.current = childWindow
        const baseConnection = transformConnection(
          filterConnection({
            send: msg => childWindow.postMessage(msg, "*"),
            onMsg: cb => {
              window.addEventListener("message", cb)
              return () => window.removeEventListener("message", cb)
            },
          }, (ev: any): ev is unknown => ev.origin === location.origin),
          x => x,
          (ev: any) => ev.data,
        )
        const clientMessenger = createServerClientMessenger({
          connection: brandConnection(baseConnection, "client"),
          hashToUrl:  hash => createBlob(artifactStore.raw.get(hash) ?? Buffer.alloc(0)),
          createRendererMessenger: createRendererWorker,
          serverEmitter,
        })
        const saveMessenger = createMessenger<{ share(): Promise<void> }, {}, {}>({
          impl: {
            async share(){
              const isProd = location.hostname === "escad.dev"
              const createUrl = isProd ? "https://escad.run/create" : "/create"
              const response = await fetch(createUrl, {
                method: "POST",
                body: JSON.stringify({
                  url: location.href,
                  renderer: fs.readFileSync("/out/bundle.js", "utf8"),
                  client: fs.readFileSync("/static/bundle.js", "utf8"),
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }).then(r => r.json())
              location = response.url
            },
          },
          connection: brandConnection(baseConnection, "share"),
        })
        onNewWindow.current = () => {
          clientMessenger.destroy()
          saveMessenger.destroy()
        }
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
})
