
import "../stylus/Status.styl"
import { mdiCheck, mdiClose, mdiRefresh } from "@mdi/js"
import Icon from "@mdi/react"
import React, { useContext } from "react"
import { observer } from "rhobo"
import { ClientState } from "./ClientState"

export interface Status {
  text: string,
  className?: string,
  icon: string,
  onClick?: () => void,
}

export const baseStatuses = {
  connected: {
    text: "Connected",
    className: "connected",
    icon: mdiCheck,
  },
  disconnected: {
    text: "Disconnected",
    className: "disconnected",
    icon: mdiClose,
  },
  reload: {
    text: "Reload Required",
    className: "reload",
    icon: mdiRefresh,
    onClick: () => window.location.reload(),
  },
}

export const Status = observer(() => {
  const state = useContext(ClientState.Context)
  const status = state.status()
  if(!status) return null
  const className = "Status " + (status.className ?? "") + (status.onClick ? " clickable" : "")
  return <div className={className} onClick={status.onClick}>
    <Icon path={status.icon}/>
    <span>{status.text}</span>
  </div>
})
