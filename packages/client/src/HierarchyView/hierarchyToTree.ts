
import {
  Hash,
  Product,
  Hierarchy,
  NameHierarchy,
  ValueHierarchy,
  ObjectHierarchy,
  ArrayHierarchy,
  CallHierarchy,
  assertNever,
} from "@escad/core"
import { HierarchyPath } from "../HierarchyPath"
import { StateMemo, getState } from "./State"
import { Tree, TreePart } from "./Tree"
import { TreeTextPart } from "./TreeText"

/**
 * Converts a `Hierarchy` to a `Tree`
 * @param path
 *   The path to get to this hierarchy from root. For the root call, this is `[]`.
 *   Controls state memoization as well as selection behavior.
 * @param hierarchy The hierarchy to convert.
 * @param stateMemo
 *   This memoizes the open/close state between multiple `hierarchyToTree` calls (including with different hierarchies).
 */
export function hierarchyToTree(path: HierarchyPath, hierarchy: Hierarchy, stateMemo: StateMemo): Tree{
  return wrapLinkedProducts(path, hierarchy.linkedProducts, _hierarchyToTree(path, hierarchy, stateMemo))
}

function wrapLinkedProducts(
  path: HierarchyPath,
  linkedProducts: readonly Hash<Product>[] | undefined,
  tree: Tree,
): Tree{
  if(!linkedProducts?.length)
    return tree
  return [
    TreePart.Text(TreeTextPart.SelectableStart(path)),
    ...tree,
    TreePart.Text(TreeTextPart.RangeEnd()),
  ]
}

function _hierarchyToTree(path: HierarchyPath, hierarchy: Hierarchy, stateMemo: StateMemo): Tree{
  if(NameHierarchy.isNameHierarchy(hierarchy))
    return [TreePart.Text.String(hierarchy.name)]
  if(ValueHierarchy.isValueHierarchy(hierarchy))
    return [TreePart.Text.String(
      hierarchy.value === null
        ? "null"
        : typeof hierarchy.value === "object"
          ? "undefined" in hierarchy.value
            ? "undefined"
            : `Symbol(${hierarchy.value ?? ""})`
          : JSON.stringify(hierarchy.value),
    )]
  if(ObjectHierarchy.isObjectHierarchy(hierarchy))
    return [
      TreePart.Text.String("{"),
      TreePart.Children({
        children: Object.entries(hierarchy.children).map(([key, value]) => {
          const newPath: HierarchyPath = [...path, { type: "ObjectHierarchyPathPart", key }]
          return wrapLinkedProducts(newPath, value.linkedProducts, [
            TreePart.Text.String(key),
            TreePart.Text.String(": "),
            TreePart.Children({
              children: [hierarchyToTree(newPath, value, stateMemo)],
              state: getState(stateMemo, path, key + ":"),
            }),
          ])
        }),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
        forceOpenable: true,
      }),
      TreePart.Text.String("}"),
    ]
  if(ArrayHierarchy.isArrayHierarchy(hierarchy))
    return [
      TreePart.Text.String("["),
      TreePart.Children({
        children: hierarchy.children.map((value, index) =>
          hierarchyToTree(
            [...path, { type: "ArrayHierarchyPathPart", index }],
            value,
            stateMemo,
          ),
        ),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
        forceOpenable: hierarchy.children.length > 1,
      }),
      TreePart.Text.String("]"),
    ]
  if(CallHierarchy.isCallHierarchy(hierarchy)) {
    if(!hierarchy.composable)
      return [
        ...hierarchyToTree(
          [...path, { type: "CallHierarchyPathPart", location: "operator" }],
          hierarchy.operator,
          stateMemo,
        ),
        ..._callHierarchyOperandsTree(path, hierarchy.operands),
        ...(hierarchy.result ? [
          TreePart.Text.String(" = "),
          TreePart.Children({
            state: getState(stateMemo, path, "result"),
            children: [hierarchyToTree(
              [...path, { type: "CallHierarchyPathPart", location: "result" }],
              hierarchy.result,
              stateMemo,
            )],
            forceEllipsis: true,
          }),
        ] : []),
      ]
    const operators: Tree[] = []
    let operands: Hierarchy[] = [hierarchy]
    let curPath = path
    let start = true
    while(operands.length === 1 && CallHierarchy.isCallHierarchy(operands[0]) && operands[0].composable) {
      if(!start)
        curPath = [...curPath, { type: "CallHierarchyPathPart", location: "onlyOperand" }]
      start = false
      const [curHierarchy] = operands
      operands = curHierarchy.operands
      operators.push([
        ...hierarchyToTree(curPath, {
          ...curHierarchy.operator,
          linkedProducts: curHierarchy.linkedProducts,
        }, stateMemo),
        ...(curHierarchy.result ? [
          TreePart.Text.String(" -> "),
          TreePart.Children({
            state: getState(stateMemo, curPath, "result"),
            children: [hierarchyToTree(
              [...curPath, { type: "CallHierarchyPathPart", location: "result" }],
              curHierarchy.result,
              stateMemo,
            )],
            forceEllipsis: true,
          }),
        ] : []),
      ])
    }
    return [
      TreePart.Text.String("("),
      TreePart.Children({
        children: operators,
        joiner: "∘",
        state: getState(stateMemo, path, "operators"),
        forceOpenable: true,
      }),
      TreePart.Text.String(")"),
      ..._callHierarchyOperandsTree(curPath, operands),
    ]
  }
  assertNever(hierarchy)

  function _callHierarchyOperandsTree(path: HierarchyPath, operands: Hierarchy[]){
    return wrapLinkedProducts(
      [...path, { type: "CallHierarchyPathPart", location: "allOperands" }],
      Hierarchy.flattenLinkedProducts(operands),
      [
        TreePart.Text.String("("),
        TreePart.Children({
          children: operands.map((value, index) =>
            hierarchyToTree(
              [...path, {
                type: "CallHierarchyPathPart",
                location: operands.length === 1 ? "onlyOperand" : index,
              }],
              value,
              stateMemo,
            ),
          ),
          joiner: ", ",
          state: getState(stateMemo, path, "operands"),
          forceOpenable: operands.length !== 1 || !(
            ArrayHierarchy.isArrayHierarchy(operands[0])
            || ObjectHierarchy.isObjectHierarchy(operands[0])
          ),
        }),
        TreePart.Text.String(")"),
      ],
    )
  }
}
