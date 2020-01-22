/* @flow */

import { observable } from "rhobo";
import WS from "./ws";

class State {

  ws = new WS("ws" + window.location.toString().slice(4) + "ws/", this);

  connected = observable<boolean>(false);
  id = observable<string>();
  serverId = observable<string>();

}

export default new State();
export { State };
