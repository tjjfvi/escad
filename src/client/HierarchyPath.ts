import { ArrayHierarchy, assertNever, Hierarchy } from "../core/mod.ts";

interface ObjectHierarchyPathPart {
  readonly type: "ObjectHierarchyPathPart";
  readonly key: string;
}

interface ArrayHierarchyPathPart {
  readonly type: "ArrayHierarchyPathPart";
  readonly index: number;
}

interface CallHierarchyPathPart {
  readonly type: "CallHierarchyPathPart";
  readonly location:
    | "operator"
    | "result"
    | "onlyOperand"
    | "allOperands"
    | number;
}

export type HierarchyPathPart =
  | ObjectHierarchyPathPart
  | ArrayHierarchyPathPart
  | CallHierarchyPathPart;

export type HierarchyPath = HierarchyPathPart[];

export function getHierarchyPath(path: HierarchyPath, hierarchy: Hierarchy) {
  for (const pathPart of path) {
    const newHierarchy = getHierarchyPathPart(pathPart, hierarchy);
    if (!newHierarchy) return null;
    hierarchy = newHierarchy;
  }

  return hierarchy;
}

function getHierarchyPathPart(
  pathPart: HierarchyPathPart,
  hierarchy: Hierarchy,
): Hierarchy | null {
  // Unwraps single-operand CallHierarchy nodes to handle extra operations gracefully
  while (
    hierarchy.type === "CallHierarchy" &&
    hierarchy.operands.length === 1 &&
    !(pathPart.type === "CallHierarchyPathPart" &&
      typeof pathPart.location === "string")
  ) {
    hierarchy = hierarchy.operands[0];
  }

  // Ignores single-operand CallHierarchyPathParts to handle fewer operations gracefully
  if (
    hierarchy.type !== "CallHierarchy" &&
    pathPart.type === "CallHierarchyPathPart" &&
    pathPart.location === "onlyOperand"
  ) {
    return hierarchy;
  }

  if (
    pathPart.type === "CallHierarchyPathPart" &&
    hierarchy.type === "CallHierarchy"
  ) {
    if (pathPart.location === "result") {
      return hierarchy.result ?? null;
    }
    if (pathPart.location === "operator") {
      return hierarchy.operator;
    }
    if (pathPart.location === "onlyOperand") {
      if (hierarchy.operands.length === 1) {
        return hierarchy.operands[0];
      } else {
        return null;
      }
    }
    if (pathPart.location === "allOperands") {
      return ArrayHierarchy.create({ children: hierarchy.operands });
    }
    if (typeof pathPart.location === "number") {
      return hierarchy.operands[pathPart.location];
    }
    assertNever(pathPart.location);
  }

  if (
    pathPart.type === "ObjectHierarchyPathPart" &&
    hierarchy.type === "ObjectHierarchy" &&
    pathPart.key in hierarchy.children
  ) {
    return hierarchy.children[pathPart.key];
  }

  if (
    pathPart.type === "ArrayHierarchyPathPart" &&
    hierarchy.type === "ArrayHierarchy" &&
    pathPart.index in hierarchy.children
  ) {
    return hierarchy.children[pathPart.index];
  }

  return null;
}
