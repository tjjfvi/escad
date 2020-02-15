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

  constructor(){
    this.ws.on("hierarchy", d => this.hierarchy(this.processHierarchy(d)));
    this.ws.on("paramDef", d => this.paramDef(d));
    this.params.ee.on("change", () => this.ws.s("params", this.params()))
  }

  processHierarchy({ name, important, sha, shas, children }){
    children = children.map(x => this.processHierarchy(x));
    shas = sha ? [sha] : children.flatMap(x => x.shas);
    let tree = { children, shas, name, important, pre: [], post: [] }
    let child = children.length === 1 ? children[0] : null;
    Object.assign(tree,
      child ?
        !child.important ?
          { children: child.children, post: [{ name: child.name, shas: child.shas }, ...child.post] } :
          important ?
            {} :
            { ...child, pre: [{ name, shas }, ...child.pre] } :
        {}
    );
    return tree;
  }

}

export default new State();
export { State };
