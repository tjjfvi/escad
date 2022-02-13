import { ObjectParamGeneric, ObjectParamValue } from "./ObjectParam.ts";

type ParametrizedFunc<P extends ObjectParamGeneric, O> = {
  (params: ObjectParamValue<P>): O;
  paramDef: P;
};

export function parametrize<P extends ObjectParamGeneric, O>(
  paramDef: P,
  fn: (params: ObjectParamValue<P>) => O,
) {
  const newFn = fn as ParametrizedFunc<P, O>;
  newFn.paramDef = paramDef;
  return newFn;
}
