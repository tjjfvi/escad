import { ObjectParamGeneric, ObjectParamGenericValue } from "@escad/parameters"
import { Elementish } from "@escad/core"

export class RenderFunction<O extends ObjectParamGeneric> {

  constructor(public paramDef: O, public func: (params: ObjectParamGenericValue<O>) => Elementish<any>){

  }

}

export const renderFunction = (
  <O extends ObjectParamGeneric>(paramDef: O, func: (params: ObjectParamGenericValue<O>) => Elementish<any>) =>
    new RenderFunction(paramDef, func)
);
