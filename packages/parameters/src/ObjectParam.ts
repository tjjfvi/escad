
import { Id } from "@escad/core";
import { Parameter } from "./Parameter";

export type ObjectParamGeneric = Record<string, Parameter<any>>;

export interface ObjectParamArgs<O extends ObjectParamGeneric> {
  readonly children: O,
}

const objectParamId = Id.create(__filename, "@escad/parameters", "0", "ObjectParam");

export type ObjectParamValue<O extends ObjectParamGeneric> = {
  [K in keyof O]: O[K] extends Parameter<infer T> ? T : never;
}

export interface ObjectParam<O extends ObjectParamGeneric> extends Parameter<ObjectParamValue<O>>, ObjectParamArgs<O> {
  readonly type: typeof objectParamId,
}

export const ObjectParam = {
  create: <O extends ObjectParamGeneric>(children: O): ObjectParam<O> => ({
    type: objectParamId,
    children,
    defaultValue: mapObj(children, v => v.defaultValue) as any
  })
};

export const objectParam = ObjectParam.create;

const mapObj = <O>(o: O, f: (v: O[keyof O], k: keyof O) => unknown): unknown =>
  Object.assign({}, ...Object.entries(o).map(([k, v]: any) => ({ [k]: f(v, k) })));
