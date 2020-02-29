// @flow

import React from "react";
import state from "./State";
import Pane from "./Pane";
import { observer, useObservable, useComputed } from "rhobo";

const Parameters = () => {
  state.paramDef.use()
  let def = state.paramDef();
  if(!def)
    return <></>;
  return <Pane left name="Parameters">
    {def.map(d => {
      let { key, name = nameFromKey(key), type, desc = "", default: def } = d;
      return <div key={d.key} className="param">
        <div className="titleDesc">
          <span className="title">{name}</span>
          <span className="desc">{desc}</span>
        </div>
        {(() => {
          if(!(key in state.params.val))
            state.params.val[key] = def
          let Comp = {
            number: NumberParam,
          }[type];
          return <Comp value={state.params.obs[key]} {...d}/>
        })()}
      </div>
    })}
  </Pane>
}

const NumberParam = observer(({ value }) => {
  value.use();
  let validate = val => {
    let v = +val;
    return !isNaN(v);
  }
  let __value = useObservable(value());
  let valid = useComputed(() => validate(__value()));
  let _value = useComputed(() => __value(), v => {
    if(!validate(v))
      return __value(v);
    __value(+v);
    value(+v);
  });
  return <div className={"NumberParam " + (valid() ? "" : "invalid")}>
    <input type="text" value={_value() || ""} onChange={e => _value(e.target.value)}/>
    <div className="incDec">
      <div className="inc" onClick={() => _value.inc()}></div>
      <div className="dec" onClick={() => _value.dec()}></div>
    </div>
  </div>;
});

const nameFromKey = key => {
  let x = key.split(/([A-Z][A-Z]+)|(?=[A-Z])|(\d+)/).join(" ").replace(/ +/g, " ");
  return x[0].toUpperCase() + x.slice(1);
}

export default Parameters;
