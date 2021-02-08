
import { EventEmitter } from "tsee";
import * as flatted from "flatted";
import { ServerClientMessage, ClientServerMessage } from "@escad/server-client-messages"
import { observable } from "rhobo";
import {
  ArtifactManager,
  artifactManager,
  ArtifactStore,
  conversionRegistry,
  ExportTypeInfo,
  Hash,
  Hierarchy,
  Product,
  ProductType,
} from "@escad/core";
import { v4 as uuidv4 } from "uuid";
import { ObjectParam } from "@escad/parameters";

type Status = "connected" | "disconnected";

export class Messenger extends EventEmitter<{
  message: (message: ServerClientMessage) => void,
}> implements ArtifactStore {

  ws: WebSocket | null;
  status = observable<Status>("disconnected");
  id = observable<string>();
  serverId = observable<string>();
  products = observable<Product[]>([]);
  exportTypes = observable<ExportTypeInfo[]>([]);
  paramDef = observable<ObjectParam<any>>();
  params = observable<Record<string, unknown>>({});
  hierarchy = observable<Hierarchy>();
  sendParams = false;

  disconnectTimeout: any;

  constructor(public url: string, public artifactManager: ArtifactManager){
    super();
    this.artifactManager.artifactStores.unshift(this);
    this.ws = this.initWs();
    this.on("message", async msg => {
      if(msg.type === "init") {
        this.id(msg.clientId);
        this.serverId(msg.serverId);
        if(this.sendParams) this.paramsChangeHander();
        return;
      }

      if(msg.type === "info") {
        this.handleProducts(msg.products);
        this.handleParamDef(msg.paramDef);
        this.handleHierarchy(msg.hierarchy);
        this.handleConversions(msg.conversions);
        this.handleExportTypes(msg.exportTypes);
      }
    })
  }

  public async handleProducts(productHashes: readonly Hash[]){
    this.products(await Promise.all(productHashes.map(async (sha): Promise<Product> =>
      await this.artifactManager.lookupRaw(sha) as Product
    )));
  }

  private async handleExportTypes(exportTypes?: ExportTypeInfo[]){
    if(exportTypes)
      this.exportTypes(exportTypes);
  }

  private async handleParamDef(paramDefHash: Hash | null){
    this.paramDef(paramDefHash ? await this.artifactManager.lookupRaw(paramDefHash) as ObjectParam<any> : null)
  }

  private async handleHierarchy(hierarchyHash: Hash | null){
    this.hierarchy(hierarchyHash ? await this.artifactManager.lookupRaw(hierarchyHash) as Hierarchy : null)
  }

  private async handleConversions(conversions?: [ProductType, ProductType][]){
    for(const [fromType, toType] of conversions ?? [])
      if(!conversionRegistry.has(fromType, toType))
        conversionRegistry.register({
          fromType,
          toType,
          convert: () => {
            throw new Error("Stub conversion erroneously called")
          },
          weight: Infinity,
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
      this.status("connected");
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

  lookupRawUrl(hash: Hash): Promise<string>{
    return new Promise(resolve => {
      const id = uuidv4();
      this.send({ type: "lookupRaw", id, hash })
      const handler = (message: ServerClientMessage) => {
        if(message.type !== "lookupRawResponse" || message.id !== id)
          return;
        resolve(message.url);
        this.removeListener("message", handler);
      }
      this.on("message", handler);
    })
  }

  async lookupRaw(hash: Hash){
    const response = await fetch(await this.lookupRawUrl(hash));
    return Buffer.from(await response.arrayBuffer())
  }

  lookupRefUrl(loc: readonly unknown[]): Promise<string>{
    return new Promise(resolve => {
      const id = uuidv4();
      this.send({ type: "lookupRef", id, loc })
      const handler = (message: ServerClientMessage) => {
        if(message.type !== "lookupRefResponse" || message.id !== id)
          return;
        resolve(message.url);
        this.removeListener("message", handler);
      }
      this.on("message", handler);
    })
  }

  async lookupRef(loc: readonly unknown[]){
    const response = await fetch(await this.lookupRefUrl(loc));
    return Buffer.from(await response.arrayBuffer())
  }

  private disconnect(ws: WebSocket){
    ws.close();
    if(this.ws !== ws)
      return;
    this.status("disconnected");
    this.ws = null;
    setTimeout(() => this.initWs(), 5000);
  }

  paramsChangeHander = () => {
    this.sendParams = true;
    this.send({ type: "params", params: this.params.value })
  }

}

export const messenger = new Messenger("ws" + window.location.toString().slice(4) + "ws/", artifactManager);
