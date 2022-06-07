import { createSignal } from "../../deps/solid.ts";
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
  const state = stateMemo.get(key) ?? createState();
  stateMemo.set(key, state);
  return state;
}

function createState() {
  const [open, setOpen] = createSignal(false);
  return {
    get open() {
      return open();
    },
    set open(value: boolean) {
      setOpen(value);
    },
  };
}
