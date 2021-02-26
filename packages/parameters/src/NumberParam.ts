
import { Id } from "@escad/core";
import { Parameter } from "./Parameter";

export interface NumberParamArgs {
  readonly defaultValue: number,
  readonly name?: string,
  readonly desc?: string,
  readonly min?: number,
  readonly max?: number,
  readonly integer?: boolean,
}

const numberParamId = Id.create(__filename, "@escad/parameters", "0", "Parameter/NumberParam");

export interface NumberParam extends Parameter<number>, NumberParamArgs {
  readonly type: typeof numberParamId,
}

export const NumberParam = {
  create: (args: NumberParamArgs): NumberParam => ({
    ...args,
    type: numberParamId,
  }),
  id: numberParamId,
}

export const numberParam = NumberParam.create;
