import "../stylus/NumberParam.styl"
import { NumberParam } from "../builtins/mod.ts"
import React from "react.ts"
import { observer, useObservable, useComputed } from "rhobo.ts"
import { NameDesc, registerParameter } from "../client/mod.ts"

registerParameter<number, NumberParam>({
  id: NumberParam.id,
  className: "NumberParam",
  component: observer(({ parameter, value }) => {
    const validate = (val: number) =>
      !(
        (isNaN(val))
        || (parameter.integer && Math.floor(val) !== val)
        || (parameter.min !== undefined && val < parameter.min)
        || (parameter.max !== undefined && val > parameter.max)
      )
    const _fieldValue = useObservable(value() + "")
    const valid = useComputed(() => validate(+_fieldValue()))
    const fieldValue = useComputed(() => _fieldValue(), v => {
      _fieldValue(v)
      if(validate(+v))
        value(+v)
    })
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
