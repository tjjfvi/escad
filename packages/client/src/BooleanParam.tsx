import { BooleanParam } from "@escad/parameters";
import React from "react";
import { observer } from "rhobo";
import { NameDesc, registerParameter } from "./Parameters";

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
