
import { checkTypeProperty } from "./checkTypeProperty"
import { _Hierarchy, Hierarchy } from "./Hierarchy"

export interface LabeledHierarchy extends _Hierarchy {
  readonly type: "LabeledHierarchy",
  readonly label: string,
  readonly value: Hierarchy,
}

export const LabeledHierarchy = {
  create: ({
    label,
    value,
    linkedProducts = value.linkedProducts,
  }: Omit<LabeledHierarchy, "type">): LabeledHierarchy => ({
    type: "LabeledHierarchy",
    label,
    value,
    linkedProducts,
  }),
  from: ([label, value]: [string, unknown], raw = false) =>
    LabeledHierarchy.create({
      label,
      value: Hierarchy.from(value, raw),
    }),
  isLabeledHierarchy: checkTypeProperty.string<LabeledHierarchy>("LabeledHierarchy"),
}
