
import {
  brandConnection,
  createMessenger,
  filterConnection,
  mapConnection,
  noopConnection,
  workerConnection,
} from "@escad/messages"
import React from "react"
import ReactDOM from "react-dom"
import { App, ClientState } from "@escad/client"
import { artifactManager, ArtifactStore } from "@escad/core"
import { createServerClientMessenger, createServerRendererMessenger } from "@escad/server"
import { mdiExportVariant, mdiPencil } from "@mdi/js"
import { InMemoryArtifactStore } from "../utils/InMemoryArtifactStore"
import { createBlob } from "../utils/createBlob"

const isRun = location.host === "escad.run" || (location.pathname.startsWith("/run"))

if(isRun) {
  const [serverClient, clientServer] = noopConnection()

  const artifactStore = new InMemoryArtifactStore()

  const worker = new Worker(createBlob(
    `importScripts("${location.origin}/static/bundled/escad.js","${location.href}renderer.bundle.js")`,
  ))

  createMessenger<Required<ArtifactStore>, {/**/}>(
    artifactStore,
    brandConnection(workerConnection(worker), "artifacts"),
  )

  const rendererMessenger = createServerRendererMessenger(
    mapConnection.log(brandConnection(workerConnection(worker), "renderer")),
  )

  createServerClientMessenger(
    mapConnection.log(serverClient),
    hash => createBlob(artifactStore.raw.get(hash) ?? new Uint8Array(0)),
    rendererMessenger,
  )

  const clientState = new ClientState(clientServer, artifactManager)
  clientState.removeStatusSet("Connection")
  clientState.removeStatusSet("Client")
  clientState.listenForBundle()
  clientState.listenForInfo()
  ReactDOM.render(<App state={clientState}/>, document.getElementById("root"))

  fetch("info.json").then(r => r.json()).then(info => {
    if(info.url)
      clientState.addStatusSet({
        name: "Fork",
        statuses: {
          fork: {
            name: "Fork",
            icon: mdiPencil,
            onClick: () => location.href = info.url,
          },
        },
        state: () => "fork",
      })
  })

  rendererMessenger.req.load("/project/index")
}

if(!isRun) {
  const baseConnection = mapConnection(
    filterConnection({
      send: msg => window.parent.postMessage(msg, "*"),
      onMsg: cb => window.addEventListener("message", cb),
      offMsg: cb => window.removeEventListener("message", cb),
    }, (ev: any): ev is unknown => ev.origin === location.origin),
    x => x,
    (ev: any) => ev.data,
  )
  const clientState = new ClientState(brandConnection(baseConnection, "client"), artifactManager)
  const saveMessenger = createMessenger<{/**/}, { share(): Promise<void> }>(
    {},
  brandConnection(baseConnection, "share"),
  )
  clientState.removeStatusSet("Connection")
  clientState.addStatusSet({
    name: "Share",
    statuses: {
      share: {
        name: "Share",
        icon: mdiExportVariant,
        onClick: () => {
          saveMessenger.req.share()
        },
      },
    },
    state: () => "share",
  })
  clientState.listenForInfo()
  clientState.listenForBundle()
  ReactDOM.render(<App state={clientState}/>, document.getElementById("root"))
}
