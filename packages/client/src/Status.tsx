
import "../stylus/Status.styl"
import MdiIcon from "@mdi/react"
import React, { useContext } from "react"
import { observer } from "rhobo"
import { ClientState } from "./ClientState"

type Icon = string | ((props: { className?: string }) => React.ReactElement | null)
const Icon = (props: { icon: Icon, className?: string }) =>
  typeof props.icon === "string"
    ? <MdiIcon path={props.icon} className={props.className}/>
    : <props.icon className={props.className}/>

export interface StatusSet {
  name: string,
  icon?: Icon,
  statuses: Record<string, Status>,
  state: () => string,
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
    {statuses.map((statusSet, i) => <Status key={i} statusSet={statusSet} />)}
  </div>
})

const Status = observer(({ statusSet }: { statusSet: StatusSet }) => {
  const state = statusSet.state()
  const status = statusSet.statuses[state]
  if(!state)
    throw new Error(`Invalid StatusSet.state "${state}"`)
  const className = "Status " + (status.className ?? "") + (status.onClick ? " clickable" : "")
  return <div className={className} onClick={status.onClick}>
    <div className="icons">
      {statusSet.icon && <Icon className="icon1" icon={statusSet.icon}/>}
      {status.icon && <Icon className="icon2" icon={status.icon}/>}
    </div>
    <span>{status.name}</span>
  </div>
})
