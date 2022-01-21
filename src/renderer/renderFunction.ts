import { ObjectParamGeneric, ObjectParamValue, Elementish } from "../core/mod.ts"

export class RenderFunction<O extends ObjectParamGeneric> {

  constructor(public paramDef: O, public func: (params: ObjectParamValue<O>) => Elementish<any>){}

}

export const renderFunction = (
  <O extends ObjectParamGeneric>(paramDef: O, func: (params: ObjectParamValue<O>) => Elementish<any>) =>
    new RenderFunction(paramDef, func)
)
