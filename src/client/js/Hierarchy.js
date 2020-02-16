// @flow

import React from "react";
import state from "./State";
import { observer, observable } from "rhobo";

const Hierarchy = () => <div className="Hierarchy">
  <h1>Hierarchy</h1>
  <div><SuperNode hierarchy={state.hierarchy.use()()}/></div>
</div>

const SuperNode = x => observer(({ hierarchy, leafSub = false }) => {
  if(!hierarchy)
    return null;
  const {
    collapse = observable<boolean>(true),
    close = observable<any>({ [hierarchy.pre.length]: hierarchy.leaf && !leafSub }),
  } = hierarchy.meta.obs || {};
  hierarchy.meta.obs = { collapse, close };
  const lleaf = !hierarchy.important && hierarchy.leaf;
  const children = hierarchy.children.map((c, i) => <SuperNode key={i} hierarchy={c} leafSub={hierarchy.leaf}/>);
  const canCollapse = hierarchy.pre.length || hierarchy.post.length || false;
  return lleaf && close()[0] ?
    <Node
      {...hierarchy}
      name=". . ."
      close={close.obs[0]}
    >{children.length ? children : [<span key={0}/>]}</Node> :
    collapse() && !(lleaf && !close()[0]) ?
      <Node
        {...hierarchy}
        name={hierarchy.important ? hierarchy.name : ". . ."}
        close={close.obs[hierarchy.pre.length]}
        collapse={canCollapse && collapse}
      >{children}</Node> :
      [...hierarchy.pre, hierarchy, ...hierarchy.post]
        .reduceRight((child, { name, important = false, pre, shas }, i) =>
          [<Node
            key={0}
            {...{ important, shas }}
            name={leafSub && close.obs[i]() ? ". . ." : name}
            close={close.obs[i]}
            collapse={canCollapse && !lleaf && pre && collapse}
          >{child}</Node>]
        , children)
})(x);

const Node = x => observer(({ name, important, shas, children, close, collapse }) =>
  <div className="Node">
    <div className={"line " + (important ? "important" : "")}>
      <div className={
        "arrow " +
        (close() ? "closed" : "") +
        (children.length ? "" : " leaf")
      } onClick={() => close.toggle()}></div>
      <span onClick={() => {
        state.shas(shas);
      }}>{name}</span>
      {collapse && <div className="collapse" onClick={() => collapse.toggle()}>{
        [0, 0, 0].map((_, i) => <div key={i} className="dot"/>)
      }</div>}
    </div>
    {close() || <div className="children">{children}</div>}
  </div>
)(x);

export default Hierarchy;
