
import { ClientServerMessenger } from "@escad/protocol"
import { observable } from "rhobo";
import {
  ArtifactManager,
  ArtifactStore,
  conversionRegistry,
  ExportTypeInfo,
  Hash,
  Hierarchy,
  Product,
  ProductType,
} from "@escad/core";
import { ObjectParam } from "@escad/core";
import { createContext } from "react";
import {
  Connection,
  createConnection,
  createEmittableAsyncIterable,
  createMessenger,
  filterConnection,
  mapConnection,
} from "@escad/messages";
import { baseStatuses, Status } from "./Status";

const _ClientStateContext = createContext<ClientState>(null as never);

export class ClientState implements ArtifactStore {

  static Context = _ClientStateContext;

  bundleHash = fetch("/bundle.hash").then(r => r.text()).catch(() => null);
  status = observable<Status | null>(baseStatuses.disconnected);
  products = observable<Product[]>([]);
  exportTypes = observable<ExportTypeInfo[]>([]);
  paramDef = observable<ObjectParam<any>>();
  params = observable<Record<string, unknown>>({});
  hierarchy = observable<Hierarchy>();
  sendParams = false;

  clientServerMessenger: ClientServerMessenger;

  triggerParamUpdate: () => void;
  onParamUpdate: () => AsyncIterable<void>;

  constructor(public connection: Connection<unknown>, public artifactManager: ArtifactManager){
    const state = this;
    this.clientServerMessenger = createMessenger({
      async *params(){
        yield state.getNullifiedParams();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of state.onParamUpdate())
          yield state.getNullifiedParams();
      }
    }, this.connection)
    this.artifactManager.artifactStores.unshift(this);
    [this.triggerParamUpdate, this.onParamUpdate] = createEmittableAsyncIterable<void>()
  }

  async listenForBundle(){
    for await (const newBundleHash of this.clientServerMessenger.req.onBundle())
      if(newBundleHash !== await this.bundleHash)
        this.status(baseStatuses.reload);
  }

  async listenForInfo(){
    for await (const info of this.clientServerMessenger.req.info()) {
      this.handleProducts(info.products);
      this.handleParamDef(info.paramDef);
      this.handleHierarchy(info.hierarchy);
      this.handleConversions(info.conversions);
      this.handleExportTypes(info.exportTypes);
    }
  }

  public async handleProducts(productHashes: readonly Hash<Product>[]){
    this.products(await Promise.all(productHashes.map(async (hash): Promise<Product> => {
      const product = await this.artifactManager.lookupRaw(hash)
      if(!product)
        throw new Error("Could not find Product under hash of " + hash)
      return product;
    })));
  }

  private async handleExportTypes(exportTypes?: ExportTypeInfo[]){
    if(exportTypes)
      this.exportTypes(exportTypes);
  }

  private async handleParamDef(paramDefHash: Hash<ObjectParam<any>> | null){
    this.paramDef(paramDefHash ? await this.artifactManager.lookupRaw(paramDefHash) : null)
  }

  private async handleHierarchy(hierarchyHash: Hash<Hierarchy> | null){
    this.hierarchy(hierarchyHash ? await this.artifactManager.lookupRaw(hierarchyHash) : null)
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

  lookupRawUrl(hash: Hash<unknown>): Promise<string>{
    return this.clientServerMessenger.req.lookupRaw(hash);
  }

  async lookupRaw(hash: Hash<unknown>){
    const response = await fetch(await this.lookupRawUrl(hash));
    return Buffer.from(await response.arrayBuffer())
  }

  lookupRefUrl(loc: readonly unknown[]): Promise<string>{
    return this.clientServerMessenger.req.lookupRef(loc);
  }

  async lookupRef(loc: readonly unknown[]){
    const response = await fetch(await this.lookupRefUrl(loc));
    return Buffer.from(await response.arrayBuffer())
  }

  getNullifiedParams(){
    return Object.keys(this.params()).length ? this.params.value : null
  }

}

export class WebSocketClientState extends ClientState {

  emit: (value: unknown) => void;
  curWs: WebSocket | undefined;
  disconnectTimeout: any;
  url: string;

  constructor(url: string, artifactManager: ArtifactManager){
    const wsConnection = createConnection(msg => this.send(msg));
    const connection = mapConnection.flatted(filterConnection.string(wsConnection));
    super(connection, artifactManager);
    this.emit = wsConnection.emit;
    this.url = url;
    this.initWs();
  }

  send(message: unknown){
    this.curWs?.send(message as never);
  }

  initWs(){
    if(this.curWs) return;
    if(this.disconnectTimeout) clearTimeout(this.disconnectTimeout);

    const ws = this.curWs = new WebSocket(this.url);
    ws.addEventListener("open", () => {
      if(this.curWs !== ws)
        return ws.close();
      this.status(baseStatuses.connected);
      this.listenForInfo();
      this.listenForBundle();
    });

    ws.addEventListener("close", () => this.disconnect(ws));
    ws.addEventListener("error", () => this.disconnect(ws));
    ws.addEventListener("message", msg => {
      this.emit(msg.data)
    });
  }

  disconnect(ws: WebSocket){
    ws.close();
    if(ws !== this.curWs)
      return;
    this.status(baseStatuses.disconnected);
    this.curWs = undefined;
    setTimeout(() => this.initWs(), 5000);
  }

}
