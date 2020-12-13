
import { EventEmitter } from "tsee"
import { ClientServerMessage, ServerClientMessage } from "@escad/server-client-messages"
import WebSocket = require("ws");
import flatted from "flatted";
import { Hex } from "@escad/core";
import { rendererMessenger } from "./rendererMessenger";
import { serverId } from "./serverId";
import { v4 as uuidv4 } from "uuid";
import { RendererServerMessage } from "@escad/server-renderer-messages";

let curProducts: Hex[] | null = null;
let curParamDef: Hex | null = null;

rendererMessenger.on("products", products => {
  curProducts = products;
})

rendererMessenger.on("paramDef", paramDef => {
  curParamDef = paramDef;
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
    this.send({ type: "products", products: curProducts ?? [] });
    this.send({ type: "paramDef", paramDef: curParamDef });

    const productsHandler = (products: Hex[]) => this.send({ type: "products", products });
    rendererMessenger.on("products", productsHandler);

    const paramDefHandler = (paramDef: Hex | null) => this.send({ type: "paramDef", paramDef });
    rendererMessenger.on("paramDef", paramDefHandler);

    this.on("message", async msg => {
      if(msg.type === "params") {

        const { params: newParams } = msg;
        const oldParams = this.params;
        this.params = newParams;

        if(!newParams && !oldParams)
          return;

        if(!newParams && oldParams) {
          this.send({ type: "products", products: curProducts ?? [] });
          rendererMessenger.on("products", productsHandler);
        }

        if(newParams && !oldParams)
          rendererMessenger.removeListener("products", productsHandler);

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
      rendererMessenger.removeListener("products", productsHandler);
      rendererMessenger.removeListener("paramDef", paramDefHandler);
      console.log("Client detached, id:", clientId);
    })

    this.startPing();

  }

  private run(){
    this.cancelRun();
    const id = uuidv4();
    const handler = (msg: RendererServerMessage) => {
      if(msg.type !== "runResponse" || msg.id !== id)
        return;
      this.send({ type: "products", products: msg.products });
      rendererMessenger.removeListener("message", handler);
    }
    rendererMessenger.addListener("message", handler);
    this.cancelRun = () => rendererMessenger.removeListener("message", handler);
  }

  send(message: ServerClientMessage){
    this.ws.send(flatted.stringify(message));
  }

}
