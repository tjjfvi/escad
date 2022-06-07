/** @jsxImportSource solid */
// @style "./stylus/ObjectParam.styl"
import { For } from "../deps/solid.ts";
import { ObjectParam, Parameter } from "../core/mod.ts";
import {
  NameDesc,
  ParameterView,
  registerParameter,
} from "./ParametersPane.tsx";

registerParameter<
  Record<string, unknown>,
  ObjectParam<Record<string, Parameter<any>>>
>({
  id: ObjectParam.id,
  class: "ObjectParam",
  component: (props) => (
    <>
      <NameDesc parameter={props.parameter} />
      <div class="children">
        <For each={Object.keys(props.parameter.children)}>
          {(key) => (
            <ParameterView
              parameter={props.parameter.children[key]}
              value={props.value[key]}
              setValue={(value) =>
                props.setValue({ ...props.value, [key]: value })}
            />
          )}
        </For>
      </div>
    </>
  ),
});
