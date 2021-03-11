
import { checkTypeProperty } from "./checkTypeProperty";
import { _Hierarchy, Hierarchy } from "./Hierarchy";

export interface ArrayHierarchy extends _Hierarchy {
  readonly type: "ArrayHierarchy",
  readonly children: Hierarchy[],
}

export const ArrayHierarchy = {
  create: ({
    children,
    linkedProducts = children.flatMap(x => x.linkedProducts ?? []),
  }: Omit<ArrayHierarchy, "type">): ArrayHierarchy => ({
    type: "ArrayHierarchy",
    children,
    linkedProducts,
  }),
  from: (array: unknown[], raw = false) =>
    ArrayHierarchy.create({
      children: array.map(x => Hierarchy.from(x, raw))
    }),
  isArrayHierarchy: checkTypeProperty.string<ArrayHierarchy>("ArrayHierarchy"),
}
