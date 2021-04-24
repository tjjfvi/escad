
import {
  ArrayHierarchy,
  CallHierarchy,
  Hierarchy,
  ObjectHierarchy,
  NameHierarchy,
  ValueHierarchy,
  Hash,
  Product,
  HashMap,
  assertNever,
} from "@escad/core"
import React, { useContext, useRef, useState } from "react"
import { observer, useValue } from "rhobo"
import { ClientState } from "./ClientState"
import { ResizeSensor } from "css-element-queries"
import { HierarchyPath } from "./HierarchyPath"
import { NestableSpan } from "./NestableSpan"

export const HierarchyView = ({ hierarchy, selectable }: { hierarchy: Hierarchy, selectable: boolean }) => {
  const [width, setWidth] = useState<number>(0)
  const sensorRef = useRef<ResizeSensor>()
  const stateMemo = useValue<StateMemo>(() => new HashMap())
  return <div
    ref={el => {
      sensorRef.current?.detach()
      if(!el) return
      const sensor = new ResizeSensor(el, () => {
        if(el.clientWidth !== width) setWidth(el.clientWidth)
      })
      sensorRef.current = sensor
    }}
  >
    <Tree
      width={width}
      tree={hierarchyToTree([], hierarchy, stateMemo)}
      selectable={selectable}
    />
  </div>
}

const arrowWidth = 25
const characterWidth = 10

const Tree = ({ tree, width, selectable }: { tree: Tree, width: number, selectable: boolean }) => {
  const [, _update] = useState({})
  const update = () => _update({})
  const innerWidth = width - arrowWidth
  const maxLength = innerWidth / characterWidth

  const collapsedTree = collapseTree(tree, maxLength)
  const joinedCollapsedTree = finalizeTree(collapsedTree)

  return <div className="TreeNode">
    {joinedCollapsedTree.map((part, i) => {
      const prev = joinedCollapsedTree[i - 1]
      const next = joinedCollapsedTree[i + 1]

      if(part.kind === "children")
        return <div className="children" key={i}>
          {part.children.map((y, i) => <Tree selectable={selectable} width={innerWidth} tree={y} key={i}/>)}
        </div>

      if(next && next.kind === "children")
        return <Line
          key={i}
          selectable={selectable}
          arrowState="open"
          text={part.text}
          onUpdate={update}
          onClick={() => (next.state.open = false, update())}
        />

      const expandableSections = getExpandableSections(tree, maxLength)

      const sectionsSplitInd =
        prev?.kind === "children"
          ? expandableSections.findIndex(v => v.state === prev.state) + 1
          : 0
      const relevantSections = expandableSections.slice(sectionsSplitInd)

      if(!relevantSections.length)
        return <Line
          key={i}
          selectable={selectable}
          arrowState="leaf"
          text={part.text}
          onUpdate={update}
        />

      return <Line
        key={i}
        selectable={selectable}
        arrowState="closed"
        text={part.text}
        onUpdate={update}
        onClick={() => {
          relevantSections.forEach(x => x.state.open = true)
          update()
        }}
      />
    })}</div>
}

type LineProps = {
  arrowState: "leaf" | "open" | "closed",
  text: TreeText,
  onClick?: () => void,
  onUpdate: () => void,
  selectable: boolean,
}

const Line = ({ arrowState, text, onClick, onUpdate, selectable }: LineProps) =>
  <div className="line" onDoubleClick={onClick}>
    <div className={ "arrow " + arrowState } onClick={onClick}></div>
    <TreeText selectable={selectable} text={text} onUpdate={onUpdate}/>
  </div>

interface TreeTextPartViewProps {
  children: Array<string | React.ReactElement>,
  opener: (
    | TreeTextPart.DummyRangeStart
    | TreeTextPart.OpenableStart
    | TreeTextPart.SelectableStart
  ),
  onUpdate: () => void,
  selectable: boolean,
}

const TreeTextPartView = observer(({ opener, children, onUpdate, selectable }: TreeTextPartViewProps) => {
  const state = useContext(ClientState.Context)
  if(opener.kind === "dummyRangeStart")
    return <>{children}</>
  if(opener.kind === "openableStart")
    return <NestableSpan
      className="openable"
      onClick={() => {
        opener.target.open = true
        onUpdate()
      }}
      children={children}
    />
  if(opener.kind === "selectableStart") {
    if(!selectable)
      return <>{children}</>
    const { path } = opener
    const selectionClass = findLast(state.selection() ?? [], x => Hash.equal(x.path, path))?.type ?? ""
    return <NestableSpan
      className={"selectable " + selectionClass}
      onClick={event => {
        if(event.ctrlKey || event.metaKey || event.altKey)
          state.selection([
            ...(state.selection.value ?? []),
            {
              type: event.altKey ? "exclude" : "include",
              path,
            },
          ])
        else
          state.selection([{
            type: "include",
            path,
          }])
      }}
      children={children}
    />
  }
  assertNever(opener)
})

const TreeText = ({ text, selectable, onUpdate }: { text: TreeText, selectable: boolean, onUpdate: () => void }) => {
  type Wrapper = Pick<TreeTextPartViewProps, "children" | "opener">
  let wrapperStack: Wrapper[] = [{
    children: [],
    opener: TreeTextPart.DummyRangeStart(),
  }]
  for(const [index, part] of text.entries()) {
    const currentWrapper = wrapperStack[wrapperStack.length - 1]
    if(part.kind === "string") {
      currentWrapper.children.push(part.string)
      continue
    }
    if(part.kind === "ellipsis") {
      currentWrapper.children.push(<span className="ellipsis" key={index}>{"···"}</span>)
      continue
    }
    if(
      part.kind === "dummyRangeStart"
        || part.kind === "openableStart"
        || part.kind === "selectableStart"
    ) {
      wrapperStack.push({
        children: [],
        opener: part,
      })
      continue
    }
    if(part.kind === "rangeEnd") {
      const previousWrapper = wrapperStack[wrapperStack.length - 2]
      previousWrapper.children.push(
        <TreeTextPartView
          key={index}
          onUpdate={onUpdate}
          selectable={selectable}
          opener={currentWrapper.opener}
          children={currentWrapper.children}
        />,
      )
      wrapperStack.pop()
      continue
    }
    assertNever(part)
  }
  return <span>{wrapperStack[wrapperStack.length - 1].children}</span>
}

namespace TreeTextPart {
  // eslint-disable-next-line @typescript-eslint/ban-types
  export const String = (string: string): String => ({
    kind: "string",
    string,
  })
  export interface String {
    readonly kind: "string",
    readonly string: string,
  }

  export const Ellipsis = (): Ellipsis => ({
    kind: "ellipsis",
  })
  export interface Ellipsis {
    readonly kind: "ellipsis",
  }

  export const DummyRangeStart = (): DummyRangeStart => ({
    kind: "dummyRangeStart",
  })
  export interface DummyRangeStart {
    readonly kind: "dummyRangeStart",
  }

  export const SelectableStart = (path: HierarchyPath): SelectableStart => ({
    kind: "selectableStart",
    path,
  })
  export interface SelectableStart {
    readonly kind: "selectableStart",
    readonly path: HierarchyPath,
  }

  export const OpenableStart = (target: { open: boolean }): OpenableStart => ({
    kind: "openableStart",
    target,
  })
  export interface OpenableStart {
    readonly kind: "openableStart",
    readonly target: { open: boolean },
  }

  export const RangeEnd = (): RangeEnd => ({
    kind: "rangeEnd",
  })
  export interface RangeEnd {
    readonly kind: "rangeEnd",
  }
}

type TreeTextPart =
  | TreeTextPart.String
  | TreeTextPart.Ellipsis
  | TreeTextPart.DummyRangeStart
  | TreeTextPart.SelectableStart
  | TreeTextPart.OpenableStart
  | TreeTextPart.RangeEnd

type TreeText = TreeTextPart[]

namespace TreePart {
  export const Text = (...text: TreeText | [TreeText]): Text => ({
    kind: "text",
    text: ([] as TreeText).concat(...text),
  })
  export interface Text {
    readonly kind: "text",
    readonly text: TreeText,
  }

  Text.String = (string: string) =>
    Text(TreeTextPart.String(string))

  export const Children = (data: Omit<Children, "kind">): Children => ({
    kind: "children",
    ...data,
  })
  export interface Children {
    readonly kind: "children",
    readonly state: { open: boolean },
    readonly children: readonly Tree[],
    readonly joiner?: string,
    readonly forceOpenable?: boolean,
    readonly forceEllipsis?: boolean,
  }
}

type TreePart =
  | TreePart.Text
  | TreePart.Children

type Tree = TreePart[]

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

type StateMemo = HashMap<readonly [HierarchyPath, string], { open: boolean }>

function getState(stateMemo: StateMemo, path: HierarchyPath, str: string){
  const key = [path, str] as const
  const state = stateMemo.get(key) ?? { open: false }
  stateMemo.set(key, state)
  return state
}

const hierarchyTreeMemo = new WeakMap<Hierarchy, Tree>()

function hierarchyToTree(path: HierarchyPath, hierarchy: Hierarchy, stateMemo: StateMemo): Tree{
  const tree =
    hierarchyTreeMemo.get(hierarchy)
    ?? wrapLinkedProducts(path, hierarchy.linkedProducts, _hierarchyToTree(path, hierarchy, stateMemo))
  hierarchyTreeMemo.set(hierarchy, tree)
  return tree
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
          forceOpenable: (
            operands.length === 1
              && !ArrayHierarchy.isArrayHierarchy(operands[0])
              && !ObjectHierarchy.isObjectHierarchy(operands[0])
          ),
        }),
        TreePart.Text.String(")"),
      ],
    )
  }
}

function removeSelectableRanges(text: TreeText): TreeText{
  return text.map(part =>
    part.kind === "selectableStart"
      ? TreeTextPart.DummyRangeStart()
      : part,
  )
}

function collapseTreeOnce(tree: Tree, collapseExpandable = true): Tree{
  const maybeWrapForceOpenable = (part: TreePart.Children, inner: Tree): Tree =>
    part.forceOpenable
      ? [
        TreePart.Text(TreeTextPart.OpenableStart(part.state)),
        ...inner.map(innerPart =>
          innerPart.kind === "text"
            ? TreePart.Text(removeSelectableRanges(innerPart.text))
            : innerPart,
        ),
        TreePart.Text(TreeTextPart.RangeEnd()),
      ]
      : [...inner, TreePart.Text.String("")] // Increase the length so that we know there's more work to be done
  return tree.flatMap(part => {
    if(part.kind === "text" || part.state.open || part.forceEllipsis)
      return [part]
    if(part.children.length === 1 && (collapseExpandable || !part.forceOpenable))
      return maybeWrapForceOpenable(part, part.children[0])
    if(collapseExpandable)
      return maybeWrapForceOpenable(part, interleave(part.children, TreePart.Text.String(part.joiner ?? "")).flat())
    return [part]
  })
}

function collapseTree(tree: Tree, maxLength: number, collapseExpandable = true){
  let last = tree
  let cur = collapseTreeOnce(tree, collapseExpandable)
  while(cur.length !== last.length && checkTreeWithinMaxLength(cur, maxLength)) {
    last = cur
    cur = collapseTreeOnce(cur, collapseExpandable)
  }
  return last
}

/**
 * Finishes a `Tree` to be displayed
 * - Concatentates adjacent `TreePart.Text`s
 * - Applies ranges spanning multiple non-adjacent `TreePart.Text`s to each inner element
 *
 * Example:
 * ```
 * Tree[Text[DummyRangeStart], Text[String], Children, Text[String, RangeEnd], Text[String]]
 * ```
 * becomes
 * ```
 * Tree[Text[DummyRangeStart, String, RangeEnd], Children, Text[DummyRangeStart, String, RangeEnd, String]]
 * ```
 */
function finalizeTree(originalTree: Tree){
  let treeAcc: Tree = []
  let treeTextAcc: TreeText = []
  let openRanges: TreeText = []
  for(const treePart of originalTree) {
    if(treePart.kind === "text") {
      for(const treeTextPart of treePart.text) {
        treeTextAcc.push(treeTextPart)
        if(treeTextPart.kind === "string" || treeTextPart.kind === "ellipsis")
          continue
        if(treeTextPart.kind === "rangeEnd") {
          openRanges.pop()
          continue
        }
        if(
          treeTextPart.kind === "dummyRangeStart"
          || treeTextPart.kind === "selectableStart"
          || treeTextPart.kind === "openableStart"
        ) {
          openRanges.push(treeTextPart)
          continue
        }
        assertNever(treeTextPart)
      }
      continue
    }
    if(!treePart.state.open) {
      treeTextAcc.push(
        TreeTextPart.OpenableStart(treePart.state),
        TreeTextPart.Ellipsis(),
        TreeTextPart.RangeEnd(),
      )
      continue
    }
    finishTreeTextAcc()
    treeAcc.push({ ...treePart })
  }
  finishTreeTextAcc()

  return treeAcc

  function finishTreeTextAcc(){
    for(const {} of openRanges)
      treeTextAcc.push(TreeTextPart.RangeEnd())
    treeAcc.push(TreePart.Text(treeTextAcc))
    treeTextAcc = [...openRanges]
  }
}

function checkTreeWithinMaxLength(tree: Tree, maxLength: number){
  return finalizeTree(tree).every(x => x.kind !== "text" || treeTextLength(x.text) <= maxLength)
}

function treeTextLength(text: TreeText): number{
  let total = 0
  for(const part of text)
    if(part.kind === "string")
      total += part.string.length
    else if(part.kind === "ellipsis")
      total += 2 // The space between the dots is shrunk
  return total
}

/** Like [].join, but doesn't concat the elements into strings */
function interleave<T, U>(iterable: Iterable<T>, separator: U){
  const arr: Array<T | U> = []
  let first = true
  for(const value of iterable) {
    if(!first) arr.push(separator)
    arr.push(value)
    first = false
  }
  return arr
}

function getExpandableSections(tree: Tree, maxLength: number){
  return collapseTree(tree, maxLength, false).filter((x): x is TreePart.Children => x.kind === "children")
}

/** Like [].find but it starts from the end */
function findLast<T>(array: T[], predicate: (value: T) => boolean){
  for(let i = array.length - 1; i >= 0; i--)
    if(predicate(array[i]))
      return array[i]
}
