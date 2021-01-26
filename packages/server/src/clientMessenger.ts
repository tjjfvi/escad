
import { EventEmitter } from "tsee"
import { ClientServerMessage, ServerClientMessage } from "@escad/server-client-messages"
import WebSocket = require("ws");
import flatted from "flatted";
import { rendererMessenger } from "./rendererMessenger";
import { serverId } from "./serverId";
import { v4 as uuidv4 } from "uuid";
import { LoadInfo, RendererServerMessage } from "@escad/server-renderer-messages";

let curLoadInfo: LoadInfo | null = null;
rendererMessenger.on("loadInfo", loadInfo => {
  curLoadInfo = loadInfo;
})

export class ClientMessenger extends EventEmitter<{
  message: (message: ClientServerMessage) => void,
  close: () => void,
}> {

  initialized: Promise<void>;
  params: unknown | null = null;
  cancelRun = () => {};

  constructor(public ws: WebSocket){
    super();

    this.ws.on("message", msg => {
      const msgStr = msg instanceof Array ? msg.join("") : msg.toString();
      const msgObj = flatted.parse(msgStr);
      this.emit("message", msgObj);
    })

    this.ws.on("close", () => this.emit("close"));

    this.initialized = this.awaitInitialization();
  }

  private startPing(){
    const interval = setInterval(() => this.send({ type: "ping" }), 1000);
    this.on("close", () => clearInterval(interval));
  }

  private awaitInitialization(){
    return new Promise<void>(resolve => {
      const handler = (message: ClientServerMessage) => {
        if(message.type !== "init")
          return;

        const { clientId: requestedId, serverId: oldServerId } = message;

        this.initialize(requestedId, oldServerId);

        this.removeListener("message", handler);
        resolve();
      }

      this.on("message", handler);
    });
  }

  private initialize(requestedId: string | null, oldServerId: string | null){
    let clientId: string;

    if(requestedId && oldServerId === serverId) {
      clientId = requestedId;
      console.log("Client reattached; id:", clientId);
    } else {
      clientId = uuidv4();
      console.log("Client attached; id:", clientId);
    }

    this.send({ type: "init", clientId, serverId })
    this.sendInfo(curLoadInfo);

    const loadInfoHandler = (loadInfo: LoadInfo) => {
      if(this.params)
        this.run();
      else
        this.sendInfo(loadInfo);
    };
    rendererMessenger.on("loadInfo", loadInfoHandler);

    this.on("message", async msg => {
      if(msg.type === "params") {

        const { params: newParams } = msg;
        const oldParams = this.params;
        this.params = newParams;

        if(!newParams && oldParams)
          this.sendInfo(curLoadInfo);

        if(newParams)
          this.run();
      } else if(msg.type === "lookupRaw") {
        this.send({ type: "lookupRawResponse", id: msg.id, url: "/artifacts/raw/" + msg.hash })
      } else if(msg.type === "lookupRef") {
        const hash = await rendererMessenger.lookupRef(msg.loc);
        this.send({ type: "lookupRefResponse", id: msg.id, url: "/artifacts/raw/" + hash })
      }
    })

    this.on("close", () => {
      rendererMessenger.removeListener("loadInfo", loadInfoHandler);
      console.log("Client detached, id:", clientId);
    })

    this.startPing();

  }

  private sendInfo(info: Omit<ServerClientMessage.Info, "type"> | null){
    if(info)
      this.send({ ...{ ...info, clientPlugins: undefined }, type: "info" });
  }

  private run(){
    this.cancelRun();
    const id = uuidv4();
    rendererMessenger.send({ type: "run", id, params: this.params  })
    const handler = (msg: RendererServerMessage) => {
      if(msg.type !== "runResponse" || msg.id !== id)
        return;
      this.sendInfo(msg);
      rendererMessenger.removeListener("message", handler);
    }
    rendererMessenger.addListener("message", handler);
    this.cancelRun = () => rendererMessenger.removeListener("message", handler);
  }

  send(message: ServerClientMessage){
    this.ws.send(flatted.stringify(message));
  }

}
