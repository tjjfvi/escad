import "../stylus/Parameters.styl"
import { Parameter } from "../core/mod.ts"
import React, { useContext } from "react.ts"
import { observer } from "rhobo.ts"
import { ClientState } from "./ClientState.ts"
import { Pane } from "./Pane.ts"
import { ParameterView } from "./Parameters.ts"

export const ParametersPane = observer(() => {
  const state = useContext(ClientState.Context)
  const def = state.paramDef()

  if(!def)
    return <></>
  return <Pane name="Parameters" className="Parameters" left>
    {Object.entries(def.children as Record<string, Parameter<any>>).map(([key, paramDef]) => {
      const value = state.params.obs[key]
      if(value.value === undefined)
        value(paramDef.defaultValue)
      return <ParameterView parameter={paramDef} value={value} key={key}/>
    })}
  </Pane>
})
