import { IdView } from "./IdView"
import { Observable, Writeable } from "rhobo"
import React, { useContext } from "react"
import { HashMap, Id, Parameter } from "@escad/core"
import { ClientState } from "./ClientState"

export interface ParameterRegistration<T, P extends Parameter<T>> {
  id: P["type"],
  className?: string,
  component: (props: { parameter: P, value: Writeable<T> }) => JSX.Element,
}

const parameterRegistrations = new HashMap<Id, ParameterRegistration<any, any>>()

export const registerParameter = async <T, P extends Parameter<T>>(registration: ParameterRegistration<T, P>) => {
  if(parameterRegistrations.has(registration.id))
    throw new Error(`Duplicate ParameterRegistration for id ${registration.id.full}`)
  parameterRegistrations.set(registration.id, registration)
}

export const ParameterView = <T, >({ parameter, value }: { parameter: Parameter<T>, value: Observable<T> }) => {
  const state = useContext(ClientState.Context)
  value.off("update", state.triggerParamUpdate)
  value.on("update", state.triggerParamUpdate)
  const parameterRegistration = parameterRegistrations.get(parameter.type)
  if(!parameterRegistration)
    return <div className="Parameter none">
      <span>Cannot display parameter</span>
      <IdView id={parameter.type}/>
    </div>
  return <div className={"Parameter " + (parameterRegistration.className ?? "")}>
    <parameterRegistration.component {...{ parameter, value }}/>
  </div>
}

export const NameDesc = ({ parameter }: {parameter: Parameter<unknown> }) => (
  <div className="NameDesc">
    <span className="name">{parameter.name}</span>
    <span className="desc">{parameter.desc}</span>
  </div>
)
