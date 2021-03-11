
import { checkTypeProperty } from "./checkTypeProperty";
import { _Hierarchy } from "./Hierarchy";

export interface ValueHierarchy extends _Hierarchy {
  readonly type: "ValueHierarchy",
  readonly value:
    | string
    | number
    | boolean
    | null
    | { undefined: true }
    | { symbol: string | undefined },
}

export const ValueHierarchy = {
  create: ({
    value,
    linkedProducts,
  }: Omit<ValueHierarchy, "type">): ValueHierarchy => ({
    type: "ValueHierarchy",
    value,
    linkedProducts,
  }),
  from: (value: string | number | boolean | null | undefined | symbol) =>
    ValueHierarchy.create({
      value: (
        value === undefined ?
          { undefined: true } : typeof value === "symbol" ? { symbol: value.description } : value
      )
    }),
  isValueHierarchy: checkTypeProperty.string<ValueHierarchy>("ValueHierarchy"),
}
