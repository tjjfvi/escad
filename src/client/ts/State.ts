/* @flow */

import { observable } from "rhobo";
import WS from "./ws";

class State {

  ws = new WS("ws" + window.location.toString().slice(4) + "ws/", this);

  connected = observable<boolean>(false);
  id = observable<string>();
  serverId = observable<string>();
  paramDef = observable<any>([]);
  params = observable<any>({});
  hierarchy = observable<any>();
  shas = observable<Array<string>>([]);

  constructor() {
    // this.ws.on("hierarchy", d => this.hierarchy(this.processHierarchy(d)));
    this.ws.on("shas", d => this.shas(d));
    this.ws.on("paramDef", d => this.paramDef(d));
    this.params.on("update", () => this.ws.s("params", this.params()))
  }

  // processHierarchy({ name, important, shas, children }) {
  //   children = children.map(x => this.processHierarchy(x));
  //   shas = shas.length ? shas : children.flatMap(x => (x.pre[0] || x).shas);
  //   let tree = { children, shas, name, important, pre: [], post: [], meta: {} }
  //   tree.leaf = children.every(c => c.leaf && !c.important);
  //   let child = children.length === 1 ? children[0] : null;
  //   Object.assign(tree,
  //     !tree.leaf && child ?
  //       !child.important ?
  //         { children: child.children, post: [{ name: child.name, shas: child.shas }, ...child.post] } :
  //         important ?
  //           {} :
  //           { ...child, pre: [{ name, shas }, ...child.pre] } :
  //       {}
  //   );
  //   return tree;
  // }

}

export default new State();
export { State };
