import { checkTypeProperty, ScopedId } from "../utils/mod.ts";

export interface Parameter<V> {
  readonly type: ScopedId<"Parameter">;
  readonly defaultValue: V;
  readonly name?: string;
  readonly desc?: string;
}

export const Parameter = {
  isParameter: checkTypeProperty.idScope<Parameter<unknown>>("Parameter"),
};
