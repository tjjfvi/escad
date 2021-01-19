
import { EventEmitter } from "tsee";
import * as flatted from "flatted";
import { ServerClientMessage, ClientServerMessage } from "@escad/server-client-messages"
import { observable } from "rhobo";
import { ArtifactManager, artifactManager, ArtifactStore, Hex, Product } from "@escad/core";
import { v4 as uuidv4 } from "uuid";

export class Messenger extends EventEmitter<{
  message: (message: ServerClientMessage) => void,
}> implements ArtifactStore {

  ws: WebSocket | null;
  connected = observable<boolean>(false);
  id = observable<string>();
  serverId = observable<string>();
  shas = observable<Hex[]>([]);
  products = observable<Product[]>([]);

  disconnectTimeout: any;

  constructor(public url: string, public artifactManager: ArtifactManager){
    super();
    this.artifactManager.artifactStores.unshift(this);
    this.ws = this.initWs();
    this.on("message", async msg => {
      if(msg.type === "init") {
        this.id(msg.clientId);
        this.serverId(msg.serverId);
        return;
      }

      if(msg.type === "products") {
        this.shas(msg.products);
        this.products(await Promise.all(msg.products.map(async (sha): Promise<Product> =>
          await this.artifactManager.lookupRaw(sha) as Product
        )));
        return;
      }
    })
  }

  send(message: ClientServerMessage){
    console.log("→", message);
    this.ws?.send(flatted.stringify(message));
  }

  private initWs(){
    if(this.ws)
      return this.ws;

    if(this.disconnectTimeout)
      clearTimeout(this.disconnectTimeout);

    const ws = this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => {
      if(this.ws !== ws)
        return ws.close();
      this.connected(true);
      this.send({
        type: "init",
        clientId: this.id(),
        serverId: this.serverId()
      });
    });

    this.ws.addEventListener("close", () => this.disconnect(ws));
    this.ws.addEventListener("error", () => this.disconnect(ws));

    this.ws.addEventListener("message", rawMessage => {
      if(this.ws !== ws)
        return ws.close();

      let message: ServerClientMessage = flatted.parse(rawMessage.data);

      if(this.disconnectTimeout)
        clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = setTimeout(() => this.disconnect(ws), 5000);

      if(message.type === "ping")
        return;

      console.log("←", message);

      this.emit("message", message);
    })

    return this.ws;
  }

  lookupRaw(hash: Hex){
    return new Promise<Buffer>(resolve => {
      const id = uuidv4();
      this.send({ type: "lookupRaw", id, hash })
      const handler = (message: ServerClientMessage) => {
        if(message.type !== "lookupRawResponse" || message.id !== id)
          return;
        resolve(fetch(message.url).then(async r => Buffer.from(await r.arrayBuffer())));
        this.removeListener("message", handler);
      }
      this.on("message", handler);
    })
  }

  lookupRef(loc: readonly unknown[]){
    return new Promise<Buffer>(resolve => {
      const id = uuidv4();
      this.send({ type: "lookupRef", id, loc })
      const handler = (message: ServerClientMessage) => {
        if(message.type !== "lookupRefResponse" || message.id !== id)
          return;
        resolve(fetch(message.url).then(r => Buffer.from(r.arrayBuffer())));
        this.removeListener("message", handler);
      }
      this.on("message", handler);
    })
  }

  private disconnect(ws: WebSocket){
    ws.close();
    if(this.ws !== ws)
      return;
    this.connected(false);
    this.ws = null;
    setTimeout(() => this.initWs(), 5000);
  }

}

export const messenger = new Messenger("ws" + window.location.toString().slice(4) + "ws/", artifactManager);
