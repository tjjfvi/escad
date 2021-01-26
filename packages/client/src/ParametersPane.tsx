import { Parameter } from "@escad/parameters";
import React from "react";
import { observer } from "rhobo";
import { messenger } from "./Messenger";
import Pane from "./Pane";
import { ParameterView } from "./Parameters";

export const ParametersPane = observer(() => {
  const def = messenger.paramDef();

  if(!def)
    return <></>;
  return <Pane name="Parameters" className="Parameters" left>
    {Object.entries(def.children as Record<string, Parameter<any>>).map(([key, paramDef]) => {
      const value = messenger.params.obs[key];
      if(value.value === undefined)
        value(paramDef.defaultValue)
      return <ParameterView parameter={paramDef} value={value} key={key}/>;
    })}
  </Pane>
});
