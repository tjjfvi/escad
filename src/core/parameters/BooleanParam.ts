import { Id } from "../utils/mod.ts";
import { Parameter } from "./Parameter.ts";

export interface BooleanParamArgs {
  readonly defaultValue: boolean;
  readonly name?: string;
  readonly desc?: string;
}

const booleanParamId = Id.create(
  import.meta.url,
  "@escad/core",
  "Parameter",
  "BooleanParam",
);

export interface BooleanParam extends Parameter<boolean>, BooleanParamArgs {
  readonly type: typeof booleanParamId;
}

export const BooleanParam = {
  create: (args: BooleanParamArgs): BooleanParam => ({
    ...args,
    type: booleanParamId,
  }),
  id: booleanParamId,
};

export const booleanParam = BooleanParam.create;
