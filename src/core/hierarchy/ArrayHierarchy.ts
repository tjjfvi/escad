import { checkTypeProperty } from "../utils/mod.ts";
import { _Hierarchy, Hierarchy } from "./Hierarchy.ts";

export interface ArrayHierarchy extends _Hierarchy {
  readonly type: "ArrayHierarchy";
  readonly children: Hierarchy[];
}

export const ArrayHierarchy = {
  create: ({
    children,
    linkedProducts = Hierarchy.flattenLinkedProducts(children),
  }: Omit<ArrayHierarchy, "type">): ArrayHierarchy => ({
    type: "ArrayHierarchy",
    children,
    linkedProducts,
  }),
  from: async (array: unknown[], raw = false) =>
    ArrayHierarchy.create({
      children: await Promise.all(array.map((x) => Hierarchy.from(x, raw))),
    }),
  isArrayHierarchy: checkTypeProperty.string<ArrayHierarchy>("ArrayHierarchy"),
};
