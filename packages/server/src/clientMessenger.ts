
import { EventEmitter } from "tsee"
import { ClientServerMessage, ServerClientMessage  } from "@escad/server-client-messages"
import * as WebSocket from "ws";
import flatted from "flatted";
import { B64 } from "@escad/core";
import { rendererMessenger } from "./rendererMessenger";
import { serverId } from "./serverId";
import { v4 as uuidv4 } from "uuid";

let curShas: B64[] | null = null;

rendererMessenger.on("shas", shas => {
  curShas = shas;
})

export class ClientMessenger extends EventEmitter<{
  message: (message: ClientServerMessage) => void,
  close: () => void,
}> {

  initialized: Promise<void>;

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
    const interval = setInterval(() => this.ws.ping(), 1000);
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

  private initialize(requestedId: string, oldServerId: string){
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

    const handler = (shas: B64[]) => this.send("shas", shas);
    rendererMessenger.on("shas", handler);

    this.on("close", () => {
      rendererMessenger.removeListener("shas", handler);
      console.log("Client detached, id:", id);
    })

    this.startPing();
  }

  send(...message: ServerClientMessage){
    this.ws.send(flatted.stringify(message));
  }

}
