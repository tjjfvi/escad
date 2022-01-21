import "./stylus/BooleanParam.styl";
import { BooleanParam } from "../builtins/mod.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { NameDesc, registerParameter } from "../client/mod.ts";

registerParameter<boolean, BooleanParam>({
  id: BooleanParam.id,
  className: "BooleanParam",
  component: observer(({ parameter, value }) => (
    <>
      <NameDesc parameter={parameter} />
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            checked={value()}
            onChange={() => value(!value.value)}
          />
          <div />
        </label>
      </div>
    </>
  )),
});
