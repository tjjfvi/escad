import { Id, IdComp } from "./Id";
import { Observable, useFromProm, Writeable } from "rhobo";
import React from "react";

export interface Parameter {
  type: Id,
  buffer: Buffer,
}

export interface ParameterType {
  id: Id,
  className?: string,
  component: React.FunctionComponent<{ parameter: Parameter, input: Writeable<Buffer> }>,
}

export interface ParameterTypeInput {
  id: Id | Promise<Id>,
  className?: string,
  component: React.FunctionComponent<{ parameter: Parameter, input: Writeable<Buffer> }>,
}

// eslint-disable-next-line func-call-spacing
const parameterTypeResolveMap = new Map<Id, (value: ParameterType) => void>();
const parameterTypeMap = new Map<Id, Promise<ParameterType>>();

export const registerParameterType = async <V extends any>(type: ParameterTypeInput) => {
  const id = await type.id;
  if(!parameterTypeMap.has(id))
    parameterTypeMap.set(id, Promise.resolve({ ...type, id }));
  const resolve = parameterTypeResolveMap.get(id);
  if(!resolve)
    throw new Error(`Duplicate parameterType registration for id ${id.name.value}`);
  parameterTypeResolveMap.delete(id);
  resolve({ ...type, id });
}

export const getParameterType = (id: Id) => {
  const existing = parameterTypeMap.get(id);
  if(existing)
    return existing;
  const promise = new Promise<ParameterType>(resolve => parameterTypeResolveMap.set(id, resolve));
  parameterTypeMap.set(id, promise);
  return promise;
}

export const Parameter = ({ parameter, input }: { parameter: Parameter, input: Observable<Buffer> }) => {
  const parameterType = useFromProm(() => getParameterType(parameter.type)).use()();
  if(!parameterType)
    return <div className="Parameter none"><IdComp id={parameter.type}/></div>;
  return <div className={"Parameter " + (parameterType.className ?? "")}>
    <parameterType.component {...{ parameter, input }}/>
  </div>
}
