
import React, { useState } from "react";
import { useObservable } from "rhobo";
import { hash, Hierarchy } from "@escad/core";
import { messenger } from "./Messenger";
import Pane from "./Pane";
import Icon from "@mdi/react";
import { mdiArrowExpandVertical, mdiArrowCollapseVertical } from "@mdi/js";

const ellipsis = "···"

const maxLength = 30;

type TreeText = (string | { open: true } | { close: true, onClick: () => void })[]

type TreePart =
  | { readonly text: TreeText }
  | {
    readonly state: { open: boolean },
    readonly children: readonly Tree[],
    readonly joiner?: string,
  }

type Tree = TreePart[];

export const HierarchyPane = () => {
  const hierarchy = messenger.hierarchy.use()();
  if(hierarchy)
    return <Pane right name="Hierarchy">
      <Tree tree={hierarchyTree(hierarchy)}/>
    </Pane>
  return null
}

const Arrow = ({ state, onClick }: { state: "open" | "closed" | "leaf", onClick?: () => void }) =>
  <div className={ "arrow " + state } onClick={onClick}></div>;

const Tree = ({ tree }: { tree: Tree}) => {
  const [, update] = useState({});
  const expanded = useObservable.use(false);

  const collapse = <div className="expand" onClick={() => {
    tree.forEach(x => "state" in x && (x.state.open = !expanded.value))
    expanded(!expanded.value);
  }}>
    <Icon path={expanded() ? mdiArrowCollapseVertical : mdiArrowExpandVertical}/>
  </div>;

  const collapsedTree = joinTree(expanded() ? tree : fullyCollapseTree(tree, maxLength), () => update({}));

  if(collapsedTree.length !== 1 || "children" in collapsedTree[0])
    return <div className="Node">
      {collapsedTree.map((x, i, a) => {
        if("children" in x)
          return <div className="children" key={i}>
            {x.children.map((y, i) => <Tree tree={y} key={i}/>)}
          </div>
        const next = a[i + 1];
        const state = !next || "text" in next ? null : next.state;
        return <div className="line" key={i}>
          {state ? <Arrow state="open" onClick={() => (state.open = false, update({}))}/> : <Arrow state="leaf"/>}
          <Text str={x.text}/>
          {i === 0 ? collapse : null}
        </div>
      })}
    </div>

  const sections = (expanded() ? tree : fullyCollapseTree(tree, maxLength, true)).filter(x => "children" in x);

  return <div className="Node"><div className="line">
    {
      sections.length ?
        <Arrow state="closed" onClick={() => {
          sections.forEach(x => "children" in x && (x.state.open = true));
          update({});
        }}/> :
        <Arrow state="leaf"/>
    }
    <Text str={collapsedTree[0].text}/>
  </div></div>
}

const Text = ({ str }: { str: TreeText}) =>
  <span>{
    str.reduce(([a, b, ...c], d, i) =>
      typeof d === "string" ?
        [[...a, d], b, ...c] :
        "close" in d ?
          [[...b, <span key={i} onClick={d.onClick}>{a}</span>], ...c] :
          [[], a, b, ...c]
    , [[]] as (string | React.ReactElement)[][])
  }</span>

function hierarchyTree(hierarchy: Hierarchy): Tree{
  if(hierarchy.braceType === "")
    return [{ text: [hierarchy.name] }];
  if(hierarchy.braceType === ":")
    return [
      { text: [hierarchy.name + ": "] },
      { children: [hierarchyTree(hierarchy.children[0])], state: { open: false } }
    ]
  if(hierarchy.braceType === "[" || hierarchy.braceType === "{")
    return [
      { text: [hierarchy.braceType] },
      { children: hierarchy.children.map(hierarchyTree), joiner: ", ", state: { open: false } },
      { text: [hierarchy.braceType === "[" ? "]" : "}"] },
    ]
  if(hierarchy.braceType === "|" || hierarchy.braceType === "(") {
    const operators = [];
    while(hierarchy.braceType === "|" && hierarchy.children.length === 2) {
      operators.push(hierarchy.children[0]);
      hierarchy = hierarchy.children[1];
    }
    let operands: readonly Hierarchy[];
    if(hierarchy.braceType === "|" || (hierarchy.braceType === "(" && !operators.length)) {
      operators.push(hierarchy.children[0])
      operands = hierarchy.children.slice(1)
    } else {
      operands = [hierarchy]
    }
    return [
      ...(operators.length === 1 ? hierarchyTree(operators[0]) : [
        { text: ["("] },
        { children: operators.map(hierarchyTree), joiner: "∘", state: { open: false } },
        { text: [")"] },
      ]),
      { text: ["("] },
      { children: operands.map(hierarchyTree), joiner: ", ", state: { open: false } },
      { text: [")"] },
    ]
  }
  assertNever(hierarchy.braceType);
}

function collapseTree(tree: Tree, noSingle = false): Tree{
  return tree.flatMap(x => {
    if("text" in x)
      return [x];
    if(x.children.length === 1)
      return x.children[0];
    if(!x.state.open && !noSingle)
      return [...interleave(x.children, { text: [x.joiner ?? ""] })].flat();
    return [x];
  })
}

function joinTree(tree: Tree, onUpdate?: () => void){
  const [r, s] = tree.reduce<[Tree, TreeText]>(([a, b], c) =>
    "text" in c ?
      [a, [...b, ...c.text]] :
      c.state.open ?
        [[...a, { text: b }, c], []] :
        [a, [...b, { open: true }, ellipsis, { close: true, onClick: () => (c.state.open = true, onUpdate?.()) }]]
  , [[], []]);
  return [...r, { text: s }]
}

function validTree(tree: Tree, maxLength: number){
  return joinTree(tree).every(x => "text" in x ? length(x.text) <= maxLength : true);
}

function fullyCollapseTree(tree: Tree, maxLength: number, noSingle = false){
  let last = tree;
  let cur = collapseTree(tree, noSingle);
  while(hash(cur) !== hash(last) && validTree(cur, maxLength)) {
    last = cur;
    cur = collapseTree(cur, noSingle)
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

