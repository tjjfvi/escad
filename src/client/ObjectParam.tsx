// @style "./stylus/ObjectParam.styl"
import { ObjectParam, Parameter } from "../core/mod.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { NameDesc, ParameterView, registerParameter } from "./Parameters.tsx";

registerParameter<
  Record<string, unknown>,
  ObjectParam<Record<string, Parameter<any>>>
>({
  id: ObjectParam.id,
  className: "ObjectParam",
  component: observer(({ parameter, value: obj }) => (
    <>
      <NameDesc parameter={parameter} />
      <div className="children">
        {Object.entries(parameter.children as Record<string, Parameter<any>>)
          .map(([key, paramDef]) => {
            const value = obj.obs[key];
            if (value.value === undefined) {
              value(paramDef.defaultValue);
            }
            return (
              <ParameterView parameter={paramDef} value={value} key={key} />
            );
          })}
      </div>
    </>
  )),
});
