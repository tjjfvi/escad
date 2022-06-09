/** @jsxImportSource solid */
// @style "./stylus/ParametersPane.styl"
import {
  batch,
  createMemo,
  createMutable,
  createResource,
  createSignal,
  For,
  JSX,
} from "../deps/solid.ts";
import { IdView } from "./IdView.tsx";
import {
  ArtifactManager,
  Hash,
  Id,
  ObjectParam,
  Parameter,
} from "../core/mod.ts";
import { Loading } from "./Loading.tsx";
import { fetchArtifact } from "./fetchArtifact.ts";
import { MemoShow } from "./MemoShow.tsx";

export interface ParametersPane {
  artifactManager: ArtifactManager;
  paramDefHash: Hash<ObjectParam<any>> | null;
  params: Record<string, any> | null;
  setParams: (params: Record<string, any> | null) => void;
}

export const ParametersPane = (props: ParametersPane) => {
  const paramDef = fetchArtifact(
    props.artifactManager,
    () => props.paramDefHash,
  );

  const params = () => props.params ?? paramDef()!.defaultValue;

  return (
    <MemoShow when={paramDef()} fallback={<Loading />}>
      {(paramDef) => (
        <div class="ParametersPane">
          <For each={Object.keys(paramDef().children)}>
            {(key) => {
              return (
                <ParameterView
                  parameter={paramDef().children[key]}
                  value={params()[key]}
                  setValue={(value) =>
                    props.setParams({
                      ...params(),
                      [key]: value,
                    })}
                />
              );
            }}
          </For>
        </div>
      )}
    </MemoShow>
  );
};

export interface ParameterRegistration<T, P extends Parameter<T>> {
  id: P["type"];
  class?: string;
  component: (props: ParameterViewProps<T, P>) => JSX.Element;
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

export interface ParameterViewProps<T, P extends Parameter<T>> {
  parameter: P;
  value: T;
  setValue: (value: T) => void;
}

export const ParameterView = <T,>(
  props: ParameterViewProps<T, Parameter<T>>,
) => {
  const parameterRegistration = parameterRegistrations.get(
    props.parameter.type,
  );
  if (!parameterRegistration) {
    return (
      <div class="Parameter none">
        <span>Cannot display parameter</span>
        <IdView id={props.parameter.type} />
      </div>
    );
  }
  return (
    <div class={"Parameter " + (parameterRegistration.class ?? "")}>
      <parameterRegistration.component {...props} />
    </div>
  );
};

export const NameDesc = ({ parameter }: { parameter: Parameter<unknown> }) => (
  <div class="NameDesc">
    <span class="name">{parameter.name}</span>
    <span class="desc">{parameter.desc}</span>
  </div>
);
