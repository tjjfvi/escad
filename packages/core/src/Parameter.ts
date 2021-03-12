import { checkTypeProperty } from "./checkTypeProperty";
import { ScopedId } from "./Id";

export interface Parameter<V> {
  readonly type: ScopedId<"Parameter">,
  readonly defaultValue: V,
  readonly name?: string,
  readonly desc?: string,
}

export const Parameter = {
  isParameter: checkTypeProperty.idScope<Parameter<unknown>>("Parameter"),
}
