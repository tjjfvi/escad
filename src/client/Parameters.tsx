import { IdView } from "./IdView.tsx";
import { Observable, Writeable } from "../deps/rhobo.ts";
import React from "../deps/react.ts";
import { Id } from "../core/mod.ts";
import { Parameter } from "../core/mod.ts";
import { ClientState } from "./ClientState.ts";

export interface ParameterRegistration<T, P extends Parameter<T>> {
  id: P["type"];
  className?: string;
  component: (props: { parameter: P; value: Writeable<T> }) => JSX.Element;
}

const parameterRegistrations = new Map<Id, ParameterRegistration<any, any>>();

export const registerParameter = async <T, P extends Parameter<T>>(
  registration: ParameterRegistration<T, P>,
) => {
  if (parameterRegistrations.has(registration.id)) {
    throw new Error(
      `Duplicate ParameterRegistration for id ${registration.id}`,
    );
  }
  parameterRegistrations.set(registration.id, registration);
};

export const ParameterView = <T,>(
  { parameter, value }: { parameter: Parameter<T>; value: Observable<T> },
) => {
  const state = React.useContext(ClientState.Context);
  React.useEffect(() => {
    value.on("update", state.triggerParamsUpdate);
    return () => {
      value.off("update", state.triggerParamsUpdate);
    };
  });
  const parameterRegistration = parameterRegistrations.get(parameter.type);
  if (!parameterRegistration) {
    return (
      <div className="Parameter none">
        <span>Cannot display parameter</span>
        <IdView id={parameter.type} />
      </div>
    );
  }
  return (
    <div className={"Parameter " + (parameterRegistration.className ?? "")}>
      <parameterRegistration.component {...{ parameter, value }} />
    </div>
  );
};

export const NameDesc = ({ parameter }: { parameter: Parameter<unknown> }) => (
  <div className="NameDesc">
    <span className="name">{parameter.name}</span>
    <span className="desc">{parameter.desc}</span>
  </div>
);
