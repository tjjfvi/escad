
import { checkTypeProperty } from "./checkTypeProperty";
import { _Hierarchy } from "./Hierarchy";

export interface NameHierarchy extends _Hierarchy {
  readonly type: "NameHierarchy",
  readonly name: string,
}

export const NameHierarchy = {
  create: ({
    name: text,
    linkedProducts,
  }: Omit<NameHierarchy, "type">): NameHierarchy => ({
    type: "NameHierarchy",
    name: text,
    linkedProducts,
  }),
  isNameHierarchy: checkTypeProperty.string<NameHierarchy>("NameHierarchy"),
}
