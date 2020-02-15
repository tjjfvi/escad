// @flow

import React from "react";
import state from "./State";
import { observer, useObservable } from "rhobo";

const Hierarchy = () => <div className="Hierarchy">
  <h1>Hierarchy</h1>
  <SuperNode hierarchy={state.hierarchy.use()()}/>
</div>

const SuperNode = observer(({ hierarchy }) => {
  const collapse = useObservable<boolean>(true);
  const close = useObservable<Array<boolean>>([]);
  if(!hierarchy)
    return null;
  const children = hierarchy.children.map((c, i) => <SuperNode key={i} hierarchy={c}/>);
  return collapse() ?
    <Node {...hierarchy} close={close.obs[hierarchy.pre.length]} collapse={collapse}>{children}</Node> :
    [...hierarchy.pre, hierarchy, ...hierarchy.post].reduceRight((child, { name, important = false, pre, shas }, i) =>
      // eslint-disable-next-line react/jsx-key
      [<Node key={0} {...{ name, important, shas }} close={close.obs[i]} collapse={pre && collapse}>{child}</Node>]
    , children)
});

const Node = observer(({ name, important, shas, children, close, collapse }) =>
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
);

export default Hierarchy;
