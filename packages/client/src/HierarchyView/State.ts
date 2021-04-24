
import { HashMap } from "@escad/core"
import { HierarchyPath } from "../HierarchyPath"

export type State = { open: boolean }

export type StateMemo = HashMap<readonly [HierarchyPath, string], State>

export function getState(stateMemo: StateMemo, path: HierarchyPath, str: string){
  const key = [path, str] as const
  const state = stateMemo.get(key) ?? { open: false }
  stateMemo.set(key, state)
  return state
}
