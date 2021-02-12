
import { Hierarchy } from "@escad/core";
import { mdiArrowCollapseVertical, mdiArrowExpandVertical } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useContext, useState } from "react";
import { useObservable } from "rhobo";
import { ClientState } from "./ClientState";

export const HierarchyView = ({ hierarchy, maxLength }: { hierarchy: Hierarchy, maxLength: number }) =>
  <Tree maxLength={maxLength} tree={hierarchyToTree(hierarchy)}/>

const Arrow = ({ state, onClick }: { state: "open" | "closed" | "leaf", onClick?: () => void }) =>
  <div className={ "arrow " + state } onClick={onClick}></div>;

const Tree = ({ tree, maxLength }: { tree: Tree, maxLength: number }) => {
  const [, _update] = useState({});
  const update = () => _update({});
  const expanded = useObservable.use(false);

  const expandIcon = <div className="expand" onClick={() => {
    tree.forEach(x => "state" in x && (x.state.open = !expanded.value))
    expanded(!expanded.value);
  }}>
    <Icon path={expanded() ? mdiArrowCollapseVertical : mdiArrowExpandVertical}/>
  </div>;

  const collapsedTree = expanded() ? tree : fullyCollapseTree(tree, maxLength, update);
  const joinedCollapsedTree = joinTree(collapsedTree, update);

  if(
    joinedCollapsedTree.length !== 1 ||
    "children" in joinedCollapsedTree[0] ||
    !collapsedTree.some(x => "children" in x)
  )
    return <div className="TreeNode">
      {joinedCollapsedTree.map((x, i, a) => {
        if("children" in x)
          return <div className="children" key={i}>
            {x.children.map((y, i) => <Tree maxLength={maxLength} tree={y} key={i}/>)}
          </div>
        const next = a[i + 1];
        const state = !next || "text" in next ? null : next.state;
        return <div className="line" key={i}>
          {state ? <Arrow state="open" onClick={() => (state.open = false, update())}/> : <Arrow state="leaf"/>}
          <TreeText str={x.text}/>
          {i === 0 ? expandIcon : null}
        </div>
      })}
    </div>

  const sections = (expanded() ? tree : fullyCollapseTree(tree, maxLength, update, true)).filter(x => "children" in x);

  return <div className="TreeNode"><div className="line">
    {
      sections.length ?
        <Arrow state="closed" onClick={() => {
          sections.forEach(x => "children" in x && (x.state.open = true));
          update();
        }}/> :
        <Arrow state="leaf"/>
    }
    <TreeText str={joinedCollapsedTree[0].text}/>
    {expandIcon}
  </div></div>
}

const TreeTextPart = ({ children, className, onClick }:TreeTextPartProps) => {
  const handleHover = (e: React.MouseEvent) => {
    if(!onClick) return
    const value = e.type === "mousemove" && !e.defaultPrevented;
    if(hovered.value !== value) hovered(value);
    e.preventDefault();
  }
  const hovered = useObservable.use(false)
  return <span {...{
    className: (className ?? "") + (hovered() ? " hover" : ""),
    onClick: e => {
      if(!onClick) return
      e.stopPropagation();
      onClick();
    },
    onMouseMove: handleHover,
    onMouseLeave: handleHover,
  }}>
    {children}
  </span>
}

const TreeText = ({ str }: { str: TreeText}) => {
  const state = useContext(ClientState.Context);
  return <span>{
    str.reduce(([a, b, ...c], d, i) =>
      typeof d === "string" ?
        [[...a, d === ellipsis ? <span className="ellipsis" key={i}>{d}</span> : d], b, ...c] :
        "close" in d ?
          [[...b, (
            <TreeTextPart key={i} onClick={() => d.onClick?.(state)} className={d.className}>{a}</TreeTextPart>
          )], ...c] :
          [[], a, b, ...c]
    , [[]] as (string | React.ReactElement)[][])
  }</span>
}

const ellipsis = "···"

type TreeTextPart =
  | string
  | { open: true }
  | { close: true, onClick?: (state: ClientState) => void, className?: string }
type TreeText = TreeTextPart[];

type TreePart =
  | { readonly text: TreeText }
  | {
    readonly state: { open: boolean },
    readonly children: readonly Tree[],
    readonly joiner?: string,
    readonly forceOpenable?: boolean,
  }

type Tree = TreePart[];

type TreeTextPartProps = {
  children: React.ReactNode,
  onClick?: () => void,
  className?: string,
}

function wrapLinkedProducts(hierarchy: Hierarchy, tree: Tree): Tree{
  if(!hierarchy.linkedProducts.length)
    return tree;
  return [
    { text: [{ open: true }] },
    ...tree,
    { text: [{ close: true, onClick: state => state.handleProducts(hierarchy.linkedProducts), className: "link" }] },
  ]
}

function hierarchyToTree(hierarchy: Hierarchy): Tree{
  return wrapLinkedProducts(hierarchy, _hierarchyToTree(hierarchy));
}

function _hierarchyToTree(hierarchy: Hierarchy): Tree{
  const origHierarchy = hierarchy;
  if(hierarchy.braceType === "")
    return [{ text: [hierarchy.name] }];
  if(hierarchy.braceType === ":")
    return [
      { text: [hierarchy.name + ": "] },
      { children: [hierarchyToTree(hierarchy.children[0])], state: { open: false } }
    ]
  if(hierarchy.braceType === "[" || hierarchy.braceType === "{")
    return [
      { text: [hierarchy.braceType] },
      { children: hierarchy.children.map(hierarchyToTree), joiner: ", ", state: { open: false } },
      { text: [hierarchy.braceType === "[" ? "]" : "}"] },
    ]
  if(hierarchy.braceType === "|" || hierarchy.braceType === "(") {
    const operators: Hierarchy[] = [];
    while(hierarchy.braceType === "|" && hierarchy.children.length === 2) {
      operators.push({ ...hierarchy.children[0], linkedProducts: hierarchy.linkedProducts });
      hierarchy = hierarchy.children[1];
    }
    let operands: readonly Hierarchy[];
    if(hierarchy.braceType === "|" || (hierarchy.braceType === "(" && !operators.length)) {
      operators.push({
        ...hierarchy.children[0],
        linkedProducts: (
          hierarchy.braceType === "|" ?
            hierarchy.linkedProducts :
            hierarchy.children[0].linkedProducts
        )
      })
      operands = hierarchy.children.slice(1)
    } else {
      operands = [hierarchy]
    }
    return [
      ...(origHierarchy.braceType === "(" ? hierarchyToTree(operators[0]) : [
        { text: ["("] },
        { children: operators.map(hierarchyToTree), joiner: "∘", state: { open: false }, forceOpenable: true },
        { text: [")"] },
      ]),
      ...wrapLinkedProducts(Hierarchy.create({ braceType: "[", children: operands }), [
        { text: ["("] },
        {
          children: operands.map(hierarchyToTree),
          joiner: ", ",
          state: { open: false },
          forceOpenable: (
            origHierarchy.braceType === "|" &&
            operands.length === 1 &&
            operands[0].braceType !== "[" &&
            operands[0].braceType !== "{"
          ),
        },
        { text: [")"] },
      ]),
    ]
  }
  assertNever(hierarchy.braceType);
}

function collapseTree(tree: Tree, onUpdate?: () => void, noSingle = false): Tree{
  const wrapMaybeForceOpenable = (part: Extract<TreePart, { children: unknown }>, inner: Tree): Tree =>
    part.forceOpenable ?
      [
        { text: [{ open: true }] },
        ...inner.map(x => "text" in x ? {
          text: x.text.map(x =>
            typeof x === "object" && "close" in x && x.className !== "openable" ?
              { ...x, onClick: undefined } :
              x
          )
        } : x),
        {
          text: [{
            close: true,
            onClick: () => (part.state.open = true, onUpdate?.()),
            className: "openable",
          }]
        }
      ] :
      [...inner, { text: [] }]
  return tree.flatMap(part => {
    if("text" in part || part.state.open)
      return [part];
    if(part.children.length === 1 && !(noSingle && part.forceOpenable))
      return wrapMaybeForceOpenable(part, part.children[0]);
    if(!noSingle)
      return wrapMaybeForceOpenable(part, [...interleave(part.children, { text: [part.joiner ?? ""] })].flat());
    return [part];
  })
}

function joinTree(tree: Tree, onUpdate?: () => void){
  const [r, s] = tree.reduce<[Tree, TreeText]>(([a, b], c) =>
    "text" in c ?
      [a, [...b, ...c.text]] :
      c.state.open ?
        [[...a, { text: b }, c], []] :
        [a, [...b, { open: true }, ellipsis, {
          close: true,
          onClick: () => (c.state.open = true, onUpdate?.()),
          className: "openable"
        }]]
  , [[], []]);
  const t = [...r, { text: s }]
  return t.map(x => !("text" in x) ? x : {
    text: t.flatMap(y => "text" in y ? x === y ? y.text : y.text.filter(x => typeof x === "object") : [])
  })
}

function validTree(tree: Tree, maxLength: number){
  return joinTree(tree).every(x => "text" in x ? length(x.text) <= maxLength : true);
}

function fullyCollapseTree(tree: Tree, maxLength: number, onUpdate?: () => void, noSingle = false){
  let last = tree;
  let cur = collapseTree(tree, onUpdate, noSingle);
  while(cur.length !== last.length && validTree(cur, maxLength)) {
    last = cur;
    cur = collapseTree(cur, onUpdate, noSingle)
  }
  return last;
}

function* interleave<T, U>(iterable: Iterable<T>, separator: U): Iterable<T | U>{
  let first = true;
  for(const value of iterable) {
    if(!first) yield separator
    yield value;
    first = false;
  }
}

function assertNever(value: never): never{
  throw new Error("Expected never, got " + value);
}

function length(str: TreeText): number{
  return str.map(x => {
    if(typeof x === "string")
      return x.length
    return 0;
  }).reduce((a, b) => a + b, 0);
}
