
import { EventEmitter } from "tsee"
import { ClientServerMessage, ServerClientMessage } from "@escad/server-client-messages"
import WebSocket = require("ws");
import flatted from "flatted";
import { Hex } from "@escad/core";
import { rendererMessenger } from "./rendererMessenger";
import { serverId } from "./serverId";
import { v4 as uuidv4 } from "uuid";
import { RendererServerMessage } from "@escad/server-renderer-messages";

let curShas: Hex[] | null = null;
let paramDef: Hex | null = null;

rendererMessenger.on("shas", shas => {
  curShas = shas;
})

rendererMessenger.on("paramDef", pd => {
  paramDef = pd;
})

export class ClientMessenger extends EventEmitter<{
  message: (message: ClientServerMessage) => void,
  close: () => void,
}> {

  initialized: Promise<void>;
  params: Buffer | null = null;
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
    const interval = setInterval(() => this.send("ping"), 1000);
    this.on("close", () => clearInterval(interval));
  }

  private awaitInitialization(){
    return new Promise<void>(resolve => {
      const handler = (message: ClientServerMessage) => {
        if(message[0] !== "init")
          return;

        const [, requestedId, oldServerId] = message;

        this.initialize(requestedId, oldServerId);

        this.removeListener("message", handler);
        resolve();
      }

      this.on("message", handler);
    });
  }

  private initialize(requestedId: string | null, oldServerId: string | null){
    let id: string;

    if(requestedId && oldServerId === serverId) {
      id = requestedId;
      console.log("Client reattached; id:", id);
    } else {
      id = uuidv4();
      console.log("Client attached; id:", id);
    }

    this.send("init", id, serverId)
    this.send("shas", curShas ?? []);
    this.send("paramDef", paramDef);

    const shasHandler = (shas: Hex[]) => this.send("shas", shas);
    rendererMessenger.on("shas", shasHandler);

    const paramDefHandler = (paramDef: Hex | null) => this.send("paramDef", paramDef);
    rendererMessenger.on("paramDef", paramDefHandler);

    this.on("message", msg => {
      if(msg[0] === "params") {

        const [, newParams] = msg;
        const oldParams = this.params;
        this.params = newParams;

        if(!newParams && !oldParams)
          return;

        if(!newParams && oldParams) {
          this.send("shas", curShas ?? []);
          rendererMessenger.on("shas", shasHandler);
        }

        if(newParams && !oldParams)
          rendererMessenger.removeListener("shas", shasHandler);

        if(newParams)
          this.run();
      }
    })

    this.on("close", () => {
      rendererMessenger.removeListener("shas", shasHandler);
      rendererMessenger.removeListener("paramDef", paramDefHandler);
      console.log("Client detached, id:", id);
    })

    this.startPing();

  }

  private run(){
    this.cancelRun();
    const id = uuidv4();
    const handler = (msg: RendererServerMessage) => {
      if(msg[0] !== "runFinish" || msg[1] !== id)
        return;
      this.send("shas", msg[2]);
      rendererMessenger.removeListener("message", handler);
    }
    rendererMessenger.addListener("message", handler);
    this.cancelRun = () => rendererMessenger.removeListener("message", handler);
  }

  send(...message: ServerClientMessage){
    this.ws.send(flatted.stringify(message));
  }

}
