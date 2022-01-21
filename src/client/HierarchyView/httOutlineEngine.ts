
import { HierarchyPath } from "../HierarchyPath.ts"
import { HierarchyToTreeEngine, wrapTreeSelectable } from "./hierarchyToTree.ts"
import { getState, State } from "./State.ts"
import { Tree, TreePart } from "./Tree.ts"

export const httOutlineEngine: HierarchyToTreeEngine = {

  NameHierarchy: () => [],

  ValueHierarchy: () => [],

  ArrayHierarchy: ({ hierarchy, path, stateMemo, hierarchyToTree }) =>
    httOutlineEngineArray(
      hierarchy.children.map((child, index) =>
        hierarchyToTree({
          path: [...path, { type: "ArrayHierarchyPathPart", index }],
          hierarchy: child,
        }),
      ),
      getState(stateMemo, path, ""),
    ),

  ObjectHierarchy: ({ hierarchy, path, stateMemo, hierarchyToTree }) =>
    [
      TreePart.Line.String("{"),
      TreePart.Block({
        children: Object.entries(hierarchy.children).map(([key, value]) => {
          const newPath: HierarchyPath = [...path, { type: "ObjectHierarchyPathPart", key }]
          const child = hierarchyToTree({ hierarchy: value, path: newPath })
          return wrapTreeSelectable(newPath, value.linkedProducts, [
            TreePart.Line.String(key),
            ...(child.length ? [
              TreePart.Line.String(": "),
              ...child,
            ] : []),
          ])
        }),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
        forceOpenable: true,
      }),
      TreePart.Line.String("}"),
    ],

  CallHierarchy: ({ hierarchy, path, stateMemo, hierarchyToTree }) =>
    hierarchy.composable
      ? httOutlineEngineArray(
        hierarchy.operands.map((child, index) =>
          hierarchyToTree({
            path: [...path, {
              type: "CallHierarchyPathPart",
              location: hierarchy.operands.length === 1 ? "onlyOperand" : index,
            }],
            hierarchy: child,
          }),
        ),
        getState(stateMemo, path, ""),
      )
      : [],

}

function httOutlineEngineArray(children: Tree[], state: State){
  children = children.filter(c => c.length)
  if(!children.length)
    return []
  if(children.length === 1)
    return children[0]
  return [
    TreePart.Block({
      children,
      state,
      joiner: ", ",
      forceOpenable: true,
    }),
  ]
}

