import { checkTypeProperty } from "./checkTypeProperty.ts";
import { _Hierarchy, Hierarchy } from "./Hierarchy.ts";

export interface CallHierarchy extends _Hierarchy {
  readonly type: "CallHierarchy";
  readonly operator: Hierarchy;
  readonly operands: Hierarchy[];
  readonly result?: Hierarchy;
  readonly composable: boolean;
}

export const CallHierarchy = {
  create: ({
    operator,
    operands,
    result,
    composable,
    linkedProducts = result?.linkedProducts,
  }: Omit<CallHierarchy, "type">): CallHierarchy => ({
    type: "CallHierarchy",
    operator,
    operands,
    result,
    composable,
    linkedProducts,
  }),
  isCallHierarchy: checkTypeProperty.string<CallHierarchy>("CallHierarchy"),
};
