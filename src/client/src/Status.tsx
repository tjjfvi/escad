
import "../stylus/Status.styl"
import React, { useContext } from "react"
import { observer, Readable } from "rhobo"
import { ClientState } from "./ClientState"
import { Icon } from "./Icon"

export interface StatusSet {
  name: string,
  icon?: Icon,
  statuses: Record<string, Status>,
  state: Readable<string>,
}

export interface Status {
  className?: string,
  name: string,
  icon: Icon,
  onClick?: () => void,
}

export const Statuses = observer(() => {
  const state = useContext(ClientState.Context)
  const statuses = state.statuses()
  return <div className="Statuses">
    {statuses.map(statusSet => <Status key={statusSet.name} statusSet={statusSet} />)}
  </div>
})

const Status = ({ statusSet }: { statusSet: StatusSet }) => {
  const state = statusSet.state.use()()
  const status = statusSet.statuses[state]
  if(!status)
    throw new Error(`Invalid StatusSet.state "${state}"`)
  const className = "Status " + (status.className ?? "") + (status.onClick ? " clickable" : "")
  return <div className={className} onClick={status.onClick}>
    <div className="icons">
      {statusSet.icon && <Icon className="icon1" icon={statusSet.icon}/>}
      {status.icon && <Icon className="icon2" icon={status.icon}/>}
    </div>
    <span>{status.name}</span>
  </div>
}
