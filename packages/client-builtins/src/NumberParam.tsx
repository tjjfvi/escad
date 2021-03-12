import "../stylus/NumberParam.styl"
import { NumberParam } from "@escad/builtins";
import React from "react";
import { observer, useObservable, useComputed } from "rhobo";
import { NameDesc, registerParameter } from "@escad/client";

registerParameter<number, NumberParam>({
  id: NumberParam.id,
  className: "NumberParam",
  component: observer(({ parameter, value }) => {
    const validate = (val: number) =>
      !(
        (isNaN(val)) ||
        (parameter.integer && Math.floor(val) !== val) ||
        (parameter.min !== undefined && val < parameter.min) ||
        (parameter.max !== undefined && val > parameter.max)
      )
    const _fieldValue = useObservable(value() + "");
    const valid = useComputed(() => validate(+_fieldValue()));
    const fieldValue = useComputed(() => _fieldValue(), v => {
      _fieldValue(v)
      if(validate(+v))
        value(+v);
    });
    return <>
      <NameDesc parameter={parameter}/>
      <div className={"NumberParam " + (valid() ? "" : "invalid")}>
        <input type="text" value={fieldValue() || ""} onChange={e => fieldValue(e.target.value)}/>
        <div className="incDec">
          <div className="inc" onClick={() => fieldValue((+fieldValue.value + 1) + "")}></div>
          <div className="dec" onClick={() => fieldValue((+fieldValue.value - 1) + "")}></div>
        </div>
      </div>
    </>
  }),
})
