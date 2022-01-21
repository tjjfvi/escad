import { HierarchyPath } from "../HierarchyPath.ts";

export type State = { open: boolean };

export type StateMemo = Map<string, State>;

export function getState(
  stateMemo: StateMemo,
  path: HierarchyPath,
  str: string,
) {
  const key = path.flatMap((part) => [
    part.type,
    part.type === "ObjectHierarchyPathPart"
      ? part.key
      : part.type === "ArrayHierarchyPathPart"
      ? part.index
      : part.location,
  ]).concat(str).join("//");
  const state = stateMemo.get(key) ?? { open: false };
  stateMemo.set(key, state);
  return state;
}
