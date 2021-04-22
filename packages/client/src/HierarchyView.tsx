
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
import { useObservable, useValue } from "rhobo"
import { ClientState } from "./ClientState"
import { ResizeSensor } from "css-element-queries"
import { HierarchyPath } from "./HierarchyPath"

export const HierarchyView = ({ hierarchy, selectable }: { hierarchy: Hierarchy, selectable: boolean }) => {
  const [width, setWidth] = useState<number>(0)
  const sensorRef = useRef<ResizeSensor>()
  const stateMemo = useValue<StateMemo>(() => new HashMap())
  return <div
    ref={el => {
      sensorRef.current?.detach()
      if(!el) return
      const sensor = new ResizeSensor(el, () => {
        setWidth(el.clientWidth)
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

  const collapsedTree = fullyCollapseTree(tree, maxLength, update)
  const joinedCollapsedTree = joinTree(collapsedTree, update)

  return <div className="TreeNode">
    {joinedCollapsedTree.map((part, i) => {
      const prev = joinedCollapsedTree[i - 1]
      const next = joinedCollapsedTree[i + 1]

      if("children" in part)
        return <div className="children" key={i}>
          {part.children.map((y, i) => <Tree selectable={selectable} width={innerWidth} tree={y} key={i}/>)}
        </div>

      if(next && "children" in next)
        return <Line
          key={i}
          selectable={selectable}
          arrowState="open"
          text={part.text}
          onClick={() => (next.state.open = false, update())}
        />

      const expandableSections = getExpandableSections(tree, maxLength, update)

      const sectionsSplitInd =
        prev && "children" in prev
          ? expandableSections.findIndex(v => v.state === prev.state) + 1
          : 0
      const relevantSections = expandableSections.slice(sectionsSplitInd)

      if(!relevantSections.length)
        return <Line
          key={i}
          selectable={selectable}
          arrowState="leaf"
          text={part.text}
        />

      return <Line
        key={i}
        selectable={selectable}
        arrowState="closed"
        text={part.text}
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
  selectable: boolean,
}

const Line = ({ arrowState, text, onClick, selectable }: LineProps) =>
  <div className="line" onDoubleClick={onClick}>
    <div className={ "arrow " + arrowState } onClick={onClick}></div>
    <TreeText selectable={selectable} text={text}/>
  </div>

const TreeTextPart = ({ children, className, onClick, path }: TreeTextPartProps) => {
  const state = useContext(ClientState.Context)
  const handleHover = (e: React.MouseEvent) => {
    if(!onClick) return
    const value = e.type === "mousemove" && !e.defaultPrevented
    if(hovered.value !== value) hovered(value)
    e.preventDefault()
  }
  const hovered = useObservable.use(false)
  state.selection.use()
  return <span {...{
    className: (className ?? "")
    + (hovered() ? " hover " : " ")
    + (path && (findLast(state.selection() ?? [], x => Hash.equal(x.path, path))?.type ?? "")),
    onClick: e => {
      if(!onClick) return
      e.stopPropagation()
      onClick(e)
    },
    onMouseMove: handleHover,
    onMouseLeave: handleHover,
  }}>
    {children}
  </span>
}

const TreeText = ({ text, selectable }: { text: TreeText, selectable: boolean }) => {
  const state = useContext(ClientState.Context)
  return <span>{
    text.reduce(([a, b, ...c], d, i) =>
      typeof d === "string"
        ? [[...a, d === ellipsis ? <span className="ellipsis" key={i}>{d}</span> : d], b, ...c]
        : "close" in d
          ? [[...b, ...(
            d.onClick || d.className || d.path
              ? [
                <TreeTextPart
                  key={i}
                  onClick={event => d.onClick?.(event, state, selectable)}
                  path={d.path}
                  className={d.className}
                >
                  {a}
                </TreeTextPart>,
              ]
              : a
          )], ...c]
          : [[], a, b, ...c]
    , [[]] as (string | React.ReactElement)[][])
  }</span>
}

const ellipsis = "···"

type TreeTextPart =
  | string
  | { open: true }
  | {
    close: true,
    onClick?: (event: React.MouseEvent, state: ClientState, selectable: boolean) => void,
    path?: HierarchyPath,
    className?: string,
  }
type TreeText = TreeTextPart[]

type TreePart =
  | { readonly text: TreeText }
  | TreePartChildren

type TreePartChildren = {
  readonly state: { open: boolean },
  readonly children: readonly Tree[],
  readonly joiner?: string,
  readonly forceOpenable?: boolean,
  readonly forceEllipsis?: boolean,
}

type Tree = TreePart[]

type TreeTextPartProps = {
  children: React.ReactNode,
  onClick?: (event: React.MouseEvent) => void,
  path?: HierarchyPath,
  className?: string,
}

function wrapLinkedProducts(
  path: HierarchyPath,
  linkedProducts: readonly Hash<Product>[] | undefined,
  tree: Tree,
): Tree{
  if(!linkedProducts?.length)
    return tree
  return [
    { text: [{ open: true }] },
    ...tree,
    {
      text: [{
        close: true,
        onClick: (event, state, selectable) => {
          if(!selectable) return
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
        },
        path,
        className: "link",
      }],
    },
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
    return [{ text: [hierarchy.name] }]
  if(ValueHierarchy.isValueHierarchy(hierarchy))
    return [{
      text: [(
        hierarchy.value === null
          ? "null"
          : typeof hierarchy.value === "object"
            ? "undefined" in hierarchy.value
              ? "undefined"
              : `Symbol(${hierarchy.value ?? ""})`
            : JSON.stringify(hierarchy.value)
      )],
    }]
  if(ObjectHierarchy.isObjectHierarchy(hierarchy))
    return [
      { text: ["{"] },
      {
        children: Object.entries(hierarchy.children).map(([key, value]) => {
          const newPath: HierarchyPath = [
            ...path,
            {
              type: "ObjectHierarchyPathPart",
              key,
            },
          ]
          return wrapLinkedProducts(newPath, value.linkedProducts, [
            { text: [key + ": "] },
            { children: [hierarchyToTree(newPath, value, stateMemo)], state: getState(stateMemo, path, key + ":") },
          ])
        }),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
      },
      { text: ["}"] },
    ]
  if(ArrayHierarchy.isArrayHierarchy(hierarchy))
    return [
      { text: ["["] },
      {
        children: hierarchy.children.map((value, index) =>
          hierarchyToTree(
            [
              ...path,
              {
                type: "ArrayHierarchyPathPart",
                index,
              },
            ],
            value,
            stateMemo,
          ),
        ),
        joiner: ", ",
        state: getState(stateMemo, path, ""),
      },
      { text: ["]"] },
    ]
  if(CallHierarchy.isCallHierarchy(hierarchy)) {
    if(!hierarchy.composable)
      return [
        ...hierarchyToTree(
          [...path, { type: "CallHierarchyPathPart", location: "operator" }],
          hierarchy.operator,
          stateMemo,
        ),
        ...wrapLinkedProducts(
          [...path, { type: "CallHierarchyPathPart", location: "allOperands" }],
          Hierarchy.flattenLinkedProducts(hierarchy.operands),
          [
            { text: ["("] },
            {
              children: hierarchy.operands.map((value, index) =>
                hierarchyToTree(
                  [...path, {
                    type: "CallHierarchyPathPart",
                    location: hierarchy.operands.length === 1 ? "onlyOperand" : index,
                  }],
                  value,
                  stateMemo,
                ),
              ),
              joiner: ", ",
              state: getState(stateMemo, path, "operands"),
            },
            { text: [")"] },
          ]),
        ...(hierarchy.result ? [
          { text: [" = "] },
          {
            state: getState(stateMemo, path, "result"),
            children: [hierarchyToTree(
              [...path, { type: "CallHierarchyPathPart", location: "result" }],
              hierarchy.result,
              stateMemo,
            )],
            forceEllipsis: true,
          },
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
          { text: [" -> "] },
          {
            state: getState(stateMemo, curPath, "result"),
            children: [hierarchyToTree(
              [...curPath, { type: "CallHierarchyPathPart", location: "result" }],
              curHierarchy.result,
              stateMemo,
            )],
            forceEllipsis: true,
          },
        ] : []),
      ])
    }
    return [
      { text: ["("] },
      { children: operators, joiner: "∘", state: getState(stateMemo, path, "operators"), forceOpenable: true },
      { text: [")"] },
      ...wrapLinkedProducts(
        [...curPath, { type: "CallHierarchyPathPart", location: "allOperands" }],
        Hierarchy.flattenLinkedProducts(operands),
        [
          { text: ["("] },
          {
            children: operands.map((value, index) =>
              hierarchyToTree(
                [...curPath, {
                  type: "CallHierarchyPathPart",
                  location: operands.length === 1 ? "onlyOperand" : index,
                }],
                value,
                stateMemo,
              ),
            ),
            joiner: ", ",
            state: getState(stateMemo, curPath, "result"),
            forceOpenable: (
              operands.length === 1
            && !ArrayHierarchy.isArrayHierarchy(operands[0])
            && !ObjectHierarchy.isObjectHierarchy(operands[0])
            ),
          },
          { text: [")"] },
        ]),
    ]
  }
  console.log(hierarchy)
  assertNever(hierarchy)
}

function collapseTree(tree: Tree, onUpdate?: () => void, noSingle = false): Tree{
  const wrapMaybeForceOpenable = (part: Extract<TreePart, { children: unknown }>, inner: Tree): Tree =>
    part.forceOpenable
      ? [
        { text: [{ open: true }] },
        ...inner.map(x => "text" in x ? {
          text: x.text.map(x =>
            typeof x === "object" && "close" in x && x.className !== "openable"
              ? { close: true as const }
              : x,
          ),
        } : x),
        {
          text: [{
            close: true,
            onClick: () => (part.state.open = true, onUpdate?.()),
            className: "openable",
          }],
        },
      ]
      : [...inner, { text: [] }]
  return tree.flatMap(part => {
    if("text" in part || part.state.open || part.forceEllipsis)
      return [part]
    if(part.children.length === 1 && !(noSingle && part.forceOpenable))
      return wrapMaybeForceOpenable(part, part.children[0])
    if(!noSingle)
      return wrapMaybeForceOpenable(part, [...interleave(part.children, { text: [part.joiner ?? ""] })].flat())
    return [part]
  })
}

function joinTree(tree: Tree, onUpdate?: () => void){
  const [r, s] = tree.reduce<[Tree, TreeText]>(([a, b], c) =>
    "text" in c
      ? [a, [...b, ...c.text]]
      : c.state.open
        ? [[...a, { text: b }, c], []]
        : [a, [...b, { open: true }, ellipsis, {
          close: true,
          onClick: () => (c.state.open = true, onUpdate?.()),
          className: "openable",
        }]]
  , [[], []])
  const t = [...r, { text: s }].filter(x => "children" in x || x.text.some(x => typeof x === "string" && x.length))
  return t.map(x => !("text" in x) ? x : {
    text: t.flatMap(y => "text" in y ? x === y ? y.text : y.text.filter(x => typeof x === "object") : []),
  })
}

function validTree(tree: Tree, maxLength: number){
  return joinTree(tree).every(x => "text" in x ? length(x.text) <= maxLength : true)
}

function fullyCollapseTree(tree: Tree, maxLength: number, onUpdate?: () => void, noSingle = false){
  let last = tree
  let cur = collapseTree(tree, onUpdate, noSingle)
  while(cur.length !== last.length && validTree(cur, maxLength)) {
    last = cur
    cur = collapseTree(cur, onUpdate, noSingle)
  }
  return last
}

function* interleave<T, U>(iterable: Iterable<T>, separator: U): Iterable<T | U>{
  let first = true
  for(const value of iterable) {
    if(!first) yield separator
    yield value
    first = false
  }
}

function length(str: TreeText): number{
  return str.map(x => {
    if(typeof x === "string")
      return x.length
    return 0
  }).reduce((a, b) => a + b, 0)
}

function getExpandableSections(tree: Tree, maxLength: number, onUpdate?: () => void){
  return fullyCollapseTree(tree, maxLength, onUpdate, true).filter((x): x is TreePartChildren => "children" in x)
}

function findLast<T>(array: T[], predicate: (value: T) => boolean){
  for(let i = array.length - 1; i >= 0; i--)
    if(predicate(array[i]))
      return array[i]
}
