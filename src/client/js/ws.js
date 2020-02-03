/* @flow */

import EE from "events";
import { State } from "./State";

class WS extends EE {

  state: State;
  url: string;
  ws: WebSocket;

  timeout;

  constructor(url, state: State){
    super();
    this.url = url;
    this.state = state;
    this.initWs();
  }

  s(...data){
    if(this.ws.readyState !== 1)
      return;
    console.log("→", ...data);
    this.ws.send(JSON.stringify(data));
  }

  initWs(){
    this.timeout = null;

    if(this.ws)
      this.ws.close();

    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => {
      this.s("init", this.state.id(), this.state.serverId());
    });

    this.ws.addEventListener("error", () => {
      if(!this.timeout) this.timeout = setTimeout(() => this.initWs(), 5000);
    })

    this.ws.addEventListener("message", msg => {
      let [type, ...data] = JSON.parse(msg.data);

      this.state.connected(true);
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.state.connected(false);
        this.ws.close();
        this.initWs();
      }, 5000);

      if(type === "ping")
        return;

      if(type === "id")
        this.state.id(data[0]);

      if(type === "serverId")
        this.state.serverId(data[0]);

      this.emit("message", type, ...data);
      this.emit(type, ...data);

      console.log("←", type, ...data);
    })
  }

}

export default WS;
