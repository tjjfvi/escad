
import { HierarchyPath } from "../HierarchyPath"
import { HierarchyToTreeEngine, wrapTreeSelectable } from "./hierarchyToTree"
import { getState, State } from "./State"
import { Tree, TreePart } from "./Tree"

export const httSimpleEngine: HierarchyToTreeEngine = {

  NameHierarchy: () => [],

  ValueHierarchy: () => [],

  ArrayHierarchy: ({ hierarchy, path, stateMemo, hierarchyToTree }) =>
    httSimpleEngineArray(
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
      TreePart.Text.String("{"),
      TreePart.Children({
        children: Object.entries(hierarchy.children).map(([key, value]) => {
          const newPath: HierarchyPath = [...path, { type: "ObjectHierarchyPathPart", key }]
          const child = hierarchyToTree({ hierarchy: value, path: newPath })
          return wrapTreeSelectable(newPath, value.linkedProducts, [
            TreePart.Text.String(key),
            ...(child.length ? [
              TreePart.Text.String(": "),
              ...child,
            ] : []),
          ])
        }),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
        forceOpenable: true,
      }),
      TreePart.Text.String("}"),
    ],

  CallHierarchy: ({ hierarchy, path, stateMemo, hierarchyToTree }) =>
    hierarchy.composable
      ? httSimpleEngineArray(
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

function httSimpleEngineArray(children: Tree[], state: State){
  children = children.filter(c => c.length)
  if(!children.length)
    return []
  if(children.length === 1)
    return children[0]
  return [
    TreePart.Children({
      children,
      state,
      joiner: ", ",
      forceOpenable: true,
    }),
  ]
}

