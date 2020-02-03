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

  constructor(){
    this.ws.on("paramDef", d => this.paramDef(d));
    this.params.ee.on("change", () => this.ws.s("params", this.params()))
  }

}

export default new State();
export { State };
