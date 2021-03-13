
import {
  ArrayHierarchy,
  CallHierarchy,
  Hierarchy,
  LabeledHierarchy,
  ObjectHierarchy,
  NameHierarchy,
  ValueHierarchy,
  Product,
  Hash,
} from "@escad/core"
import React, { useContext, useRef, useState } from "react"
import { useObservable } from "rhobo"
import { ClientState } from "./ClientState"
import { ResizeSensor } from "css-element-queries"

export const HierarchyView = ({ hierarchy }: { hierarchy: Hierarchy }) => {
  const [width, setWidth] = useState<number>(0)
  const sensorRef = useRef<ResizeSensor>()
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
      tree={hierarchyToTree(hierarchy)}
    />
  </div>
}

const Arrow = ({ state, onClick }: { state: "open" | "closed" | "leaf", onClick?: () => void }) =>
  <div className={ "arrow " + state } onClick={onClick}></div>

const arrowWidth = 25
const characterWidth = 10

const Tree = ({ tree, width }: { tree: Tree, width: number }) => {
  const [, _update] = useState({})
  const update = () => _update({})
  const innerWidth = width - arrowWidth
  const maxLength = innerWidth / characterWidth

  const collapsedTree = fullyCollapseTree(tree, maxLength, update)
  const joinedCollapsedTree = joinTree(collapsedTree, update)

  if(
    joinedCollapsedTree.length !== 1
    || "children" in joinedCollapsedTree[0]
    || !collapsedTree.some(x => "children" in x)
  )
    return <div className="TreeNode">
      {joinedCollapsedTree.map((x, i, a) => {
        if("children" in x)
          return <div className="children" key={i}>
            {x.children.map((y, i) => <Tree width={innerWidth} tree={y} key={i}/>)}
          </div>
        const next = a[i + 1]
        const state = !next || "text" in next ? null : next.state
        return <div className="line" key={i}>
          {state ? <Arrow state="open" onClick={() => (state.open = false, update())}/> : <Arrow state="leaf"/>}
          <TreeText str={x.text}/>
        </div>
      })}
    </div>

  const sections = fullyCollapseTree(tree, maxLength, update, true).filter(x => "children" in x)

  return <div className="TreeNode"><div className="line">
    {
      sections.length
        ? <Arrow state="closed" onClick={() => {
          sections.forEach(x => "children" in x && (x.state.open = true))
          update()
        }}/>
        : <Arrow state="leaf"/>
    }
    <TreeText str={joinedCollapsedTree[0].text}/>
  </div></div>
}

const TreeTextPart = ({ children, className, onClick }:TreeTextPartProps) => {
  const handleHover = (e: React.MouseEvent) => {
    if(!onClick) return
    const value = e.type === "mousemove" && !e.defaultPrevented
    if(hovered.value !== value) hovered(value)
    e.preventDefault()
  }
  const hovered = useObservable.use(false)
  return <span {...{
    className: (className ?? "") + (hovered() ? " hover" : ""),
    onClick: e => {
      if(!onClick) return
      e.stopPropagation()
      onClick()
    },
    onMouseMove: handleHover,
    onMouseLeave: handleHover,
  }}>
    {children}
  </span>
}

const TreeText = ({ str }: { str: TreeText}) => {
  const state = useContext(ClientState.Context)
  return <span>{
    str.reduce(([a, b, ...c], d, i) =>
      typeof d === "string"
        ? [[...a, d === ellipsis ? <span className="ellipsis" key={i}>{d}</span> : d], b, ...c]
        : "close" in d
          ? [[...b, ...(
            d.onClick || d.className
              ? [<TreeTextPart key={i} onClick={() => d.onClick?.(state)} className={d.className}>{a}</TreeTextPart>]
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
  | { close: true, onClick?: (state: ClientState) => void, className?: string }
type TreeText = TreeTextPart[]

type TreePart =
  | { readonly text: TreeText }
  | {
    readonly state: { open: boolean },
    readonly children: readonly Tree[],
    readonly joiner?: string,
    readonly forceOpenable?: boolean,
    readonly forceEllipsis?: boolean,
  }

type Tree = TreePart[]

type TreeTextPartProps = {
  children: React.ReactNode,
  onClick?: () => void,
  className?: string,
}

function wrapLinkedProducts(linkedProducts: readonly Hash<Product>[] | undefined, tree: Tree): Tree{
  if(!linkedProducts || !linkedProducts.length)
    return tree
  return [
    { text: [{ open: true }] },
    ...tree,
    { text: [{ close: true, onClick: state => state.handleProducts(linkedProducts), className: "link" }] },
  ]
}

const hierarchyTreeMemo = new WeakMap<Hierarchy, Tree>()

function hierarchyToTree(hierarchy: Hierarchy): Tree{
  const tree =
    hierarchyTreeMemo.get(hierarchy)
    ?? wrapLinkedProducts(hierarchy.linkedProducts, _hierarchyToTree(hierarchy))
  hierarchyTreeMemo.set(hierarchy, tree)
  return tree
}

function _hierarchyToTree(hierarchy: Hierarchy): Tree{
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
  if(LabeledHierarchy.isLabeledHierarchy(hierarchy))
    return [
      { text: [hierarchy.label + ": "] },
      { children: [hierarchyToTree(hierarchy.value)], state: { open: false } },
    ]
  if(ObjectHierarchy.isObjectHierarchy(hierarchy))
    return [
      { text: ["{"] },
      { children: hierarchy.children.map(hierarchyToTree), joiner: ", ", state: { open: false } },
      { text: ["}"] },
    ]
  if(ArrayHierarchy.isArrayHierarchy(hierarchy))
    return [
      { text: ["["] },
      { children: hierarchy.children.map(hierarchyToTree), joiner: ", ", state: { open: false } },
      { text: ["]"] },
    ]
  if(CallHierarchy.isCallHierarchy(hierarchy)) {
    if(!hierarchy.composable)
      return [
        ...hierarchyToTree(hierarchy.operator),
        ...wrapLinkedProducts(hierarchy.operands.flatMap(x => x.linkedProducts ?? []), [
          { text: ["("] },
          {
            children: hierarchy.operands.map(hierarchyToTree),
            joiner: ", ",
            state: { open: false },
          },
          { text: [")"] },
        ]),
        ...(hierarchy.result ? [
          { text: [" = "] },
          {
            state: { open: false },
            children: [hierarchyToTree(hierarchy.result)],
            forceEllipsis: true,
          },
        ] : []),
      ]
    const operators: Tree[] = []
    let operands: Hierarchy[] = [hierarchy]
    while(operands.length === 1 && CallHierarchy.isCallHierarchy(operands[0]) && operands[0].composable) {
      const [curHierarchy] = operands
      operands = curHierarchy.operands
      operators.push([
        ...hierarchyToTree({
          ...curHierarchy.operator,
          linkedProducts: curHierarchy.linkedProducts,
        }),
        ...(curHierarchy.result ? [
          { text: [" -> "] },
          {
            state: { open: false },
            children: [hierarchyToTree(curHierarchy.result)],
            forceEllipsis: true,
          },
        ] : []),
      ])
    }
    return [
      { text: ["("] },
      { children: operators, joiner: "∘", state: { open: false }, forceOpenable: true },
      { text: [")"] },
      ...wrapLinkedProducts(hierarchy.operands.flatMap(x => x.linkedProducts ?? []), [
        { text: ["("] },
        {
          children: operands.map(hierarchyToTree),
          joiner: ", ",
          state: { open: false },
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

function assertNever(value: never): never{
  throw new Error("Expected never, got " + value)
}

function length(str: TreeText): number{
  return str.map(x => {
    if(typeof x === "string")
      return x.length
    return 0
  }).reduce((a, b) => a + b, 0)
}
