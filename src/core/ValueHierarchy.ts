import { checkTypeProperty } from "./checkTypeProperty.ts";
import { _Hierarchy } from "./Hierarchy.ts";

type SerializableValue =
  | string
  | number
  | boolean
  | null;

type RawValue =
  | SerializableValue
  | undefined
  | symbol;

type ValueHierarchyValue =
  | SerializableValue
  | { undefined: true }
  | { symbol: string | undefined };

export interface ValueHierarchy extends _Hierarchy {
  readonly type: "ValueHierarchy";
  readonly value: ValueHierarchyValue;
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
  from: (value: RawValue) =>
    ValueHierarchy.create({
      value: (
        value === undefined
          ? { undefined: true }
          : typeof value === "symbol"
          ? { symbol: value.description }
          : value
      ),
    }),
  isValueHierarchy: checkTypeProperty.string<ValueHierarchy>("ValueHierarchy"),
};
