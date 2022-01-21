
import { Hash, Product, Hierarchy } from "../core/mod.ts"
import { HierarchyPath } from "../HierarchyPath.ts"
import { StateMemo } from "./State.ts"
import { Tree, TreePart } from "./Tree.ts"
import { TreeTextPart, TreeTextRange } from "./TreeText.ts"

/**
 * Converts a `Hierarchy` to a `Tree`
 * @param engine
 *   The `HierarchyToTreeEngine` to power the conversion
 * @param hierarchy
 *   The hierarchy to convert
 * @param stateMemo
 *   This memoizes the open/close state between multiple `hierarchyToTree` calls (including with different hierarchies).
 * @param path
 *   The path to get to this hierarchy from root. For the root call, this is `[]` (the default).
 *   Controls state memoization as well as selection behavior.
 */
export function hierarchyToTree(
  engine: HierarchyToTreeEngine,
  hierarchy: Hierarchy,
  stateMemo: StateMemo,
  path: HierarchyPath = [],
): Tree{
  return wrapTreeSelectable(path, hierarchy.linkedProducts, _hierarchyToTree(engine, hierarchy, stateMemo, path))
}

/**
 * The underlying conversions used in `hierarchyToTree`
 */
export type HierarchyToTreeEngine = {
  [K in Hierarchy["type"]]:
    (args: {
      path: HierarchyPath,
      hierarchy: Extract<Hierarchy, { type: K }>,
      stateMemo: StateMemo,
      hierarchyToTree: (props: { path: HierarchyPath, hierarchy: Hierarchy }) => Tree,
    }) => Tree
}

function _hierarchyToTree(
  engine: HierarchyToTreeEngine,
  hierarchy: Hierarchy,
  stateMemo: StateMemo,
  path: HierarchyPath,
){
  return engine[hierarchy.type]({
    path,
    hierarchy: hierarchy as never,
    stateMemo,
    hierarchyToTree: ({ path, hierarchy }) =>
      hierarchyToTree(engine, hierarchy, stateMemo, path),
  })
}

/**
 * Wraps a `Tree` to be selectable
 * @param path
 *   The path to the hierarchy with the relevant `linkedProducts` (used to preserve selection over multiple calls)
 * @param linkedProducts
 *   The `linkedProducts` corresponding to the relevant hierarchy (only used to determine selectability)
 * @param tree
 *   The tree to wrap
 */
export function wrapTreeSelectable(
  path: HierarchyPath,
  linkedProducts: readonly Hash<Product>[] | undefined,
  tree: Tree,
): Tree{
  if(!linkedProducts?.length || !tree.length)
    return tree
  return [
    TreePart.Line(TreeTextPart.RangeStart(TreeTextRange.Selectable(path))),
    ...tree,
    TreePart.Line(TreeTextPart.RangeEnd()),
  ]
}
