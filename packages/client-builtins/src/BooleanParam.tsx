
import "../stylus/BooleanParam.styl";
import { BooleanParam } from "@escad/builtins";
import React from "react";
import { observer } from "rhobo";
import { NameDesc, registerParameter } from "@escad/client";

registerParameter<boolean, BooleanParam>({
  id: BooleanParam.id,
  className: "BooleanParam",
  component: observer(({ parameter, value }) => (
    <>
      <NameDesc parameter={parameter}/>
      <div className="checkbox">
        <label>
          <input type="checkbox" checked={value()} onChange={() => value(!value.value)}/>
          <div/>
        </label>
      </div>
    </>
  ))
})
