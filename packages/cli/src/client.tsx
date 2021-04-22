
import React from "react"
import ReactDOM from "react-dom"
import { App, WebSocketClientState } from "@escad/client"
import { artifactManager } from "@escad/core"

const state = new WebSocketClientState("ws" + window.location.toString().slice(4) + "ws/", artifactManager)
console.log(state)
ReactDOM.render(<App state={state}/>, document.getElementById("root"))

if(process.env.DEV_MODE === "true")
  state.clientStatus.on("update", () => {
    if(state.clientStatus() === "reload")
      window.location.reload()
  })
