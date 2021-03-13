
import { checkTypeProperty } from "./checkTypeProperty"
import { _Hierarchy } from "./Hierarchy"
import { LabeledHierarchy } from "./LabeledHierarchy"

export interface ObjectHierarchy extends _Hierarchy {
  readonly type: "ObjectHierarchy",
  readonly children: LabeledHierarchy[],
}

export const ObjectHierarchy = {
  create: ({
    children,
    linkedProducts = children.flatMap(x => x.linkedProducts ?? []),
  }: Omit<ObjectHierarchy, "type">): ObjectHierarchy => ({
    type: "ObjectHierarchy",
    children,
    linkedProducts,
  }),
  from: async (object: Record<string, unknown>, raw = false) =>
    ObjectHierarchy.create({
      children: await Promise.all(Object.entries(object).map(e => LabeledHierarchy.from(e, raw))),
    }),
  isObjectHierarchy: checkTypeProperty.string<ObjectHierarchy>("ObjectHierarchy"),
}
