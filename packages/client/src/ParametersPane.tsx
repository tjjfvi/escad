import { Parameter } from "@escad/parameters";
import React, { useContext } from "react";
import { observer } from "rhobo";
import { ClientState } from "./ClientState";
import Pane from "./Pane";
import { ParameterView } from "./Parameters";

export const ParametersPane = observer(() => {
  const state = useContext(ClientState.Context);
  const def = state.paramDef();

  if(!def)
    return <></>;
  return <Pane name="Parameters" className="Parameters" left>
    {Object.entries(def.children as Record<string, Parameter<any>>).map(([key, paramDef]) => {
      const value = state.params.obs[key];
      if(value.value === undefined)
        value(paramDef.defaultValue)
      return <ParameterView parameter={paramDef} value={value} key={key}/>;
    })}
  </Pane>
});
