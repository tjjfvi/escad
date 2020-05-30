
import React from "react";
import state from "./State";
import Pane from "./Pane";
import { observer, observable } from "rhobo";
import Icon from "@mdi/react";
import { mdiArrowExpandVertical, mdiArrowCollapseVertical } from "@mdi/js";

const Hierarchy = () => <Pane right name="Hierarchy">
  <SuperNode hierarchy={state.hierarchy.use()()} />
</Pane>

const SuperNode = x => observer(({ hierarchy, leafSub = false }) => {
  if (!hierarchy)
    return null;
  const {
    collapse = observable<boolean>(true),
    close = observable<any>({ [hierarchy.pre.length]: hierarchy.leaf && !leafSub }),
  } = hierarchy.meta.obs || {};
  hierarchy.meta.obs = { collapse, close };
  const lleaf = !hierarchy.important && hierarchy.leaf;
  const children = hierarchy.children.map((c, i) => <SuperNode key={i} hierarchy={c} leafSub={hierarchy.leaf} />);
  const canCollapse = hierarchy.pre.length || hierarchy.post.length || false;
  return lleaf && close()[0] ?
    <Node
      {...hierarchy}
      name=". . ."
      close={close.obs[0]}
    >{children.length ? children : [<span key={0} />]}</Node> :
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
      <span onClick={e => {
        state.shas(e.ctrlKey ? state.shas().concat(shas) : shas);
      }}>{name}</span>
      {collapse && <div className="collapse" onClick={() => collapse.toggle()}>
        <Icon
          path={collapse() ? mdiArrowExpandVertical : mdiArrowCollapseVertical}
        />
      </div>}
    </div>
    {close() || <div className="children">{children}</div>}
  </div>
)(x);

export default Hierarchy;
