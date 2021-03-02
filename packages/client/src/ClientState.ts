
import { ClientServerMessenger, Info } from "@escad/protocol"
import { computed, observable } from "rhobo"
import {
  ArtifactManager,
  ArtifactStore,
  conversionRegistry,
  ExportTypeInfo,
  Hash,
  Hierarchy,
  Id,
  Product,
  Log,
} from "@escad/core"
import { ObjectParam } from "@escad/core"
import { createContext } from "react"
import {
  Connection,
  createMessenger,
  logConnection,
  createConnectionPair,
  serializeConnection,
} from "@escad/messages"
import { StatusSet } from "./Status"
import { HierarchySelection, resolveHierarchySelection } from "./HierarchySelection"
import { mdiAccount, mdiArrowUpDown, mdiCheck, mdiClose, mdiCubeOutline, mdiRefresh } from "@mdi/js"
import { Loading } from "./Loading"

const _ClientStateContext = createContext<ClientState>(null as never)

const stubConversionId = Id.create(__filename, "@escad/client", "Conversion", "StubConversion", "0")

export class ClientState implements ArtifactStore {

  static Context = _ClientStateContext

  bundleHash = fetch("/bundle.hash").then(r => r.text()).catch(() => null)
  serverStatus = observable<"connected" | "disconnected" | "connecting">("disconnected")
  clientStatus = observable<"current" | "bundling" | "reload">("current")
  rendererStatus = observable(0)
  statuses = observable<StatusSet[]>([
    {
      name: "Renderer",
      icon: mdiCubeOutline,
      statuses: {
        rendered: {
          className: "green",
          name: "Rendered",
          icon: mdiCheck,
        },
        rendering: {
          name: "Rendering",
          icon: Loading,
        },
      },
      state: computed(() => this.rendererStatus() ? "rendering" : "rendered"),
    },
    {
      name: "Connection",
      icon: mdiArrowUpDown,
      statuses: {
        connected: {
          className: "green",
          name: "Connected",
          icon: mdiCheck,
        },
        disconnected: {
          className: "red",
          name: "Disconnected",
          icon: mdiClose,
        },
        connecting: {
          name: "Connecting",
          icon: Loading,
        },
      },
      state: this.serverStatus,
    },
    {
      name: "Client",
      icon: mdiAccount,
      statuses: {
        current: {
          className: "green",
          name: "Up to Date",
          icon: mdiCheck,
        },
        bundling: {
          name: "Bundling",
          icon: Loading,
        },
        reload: {
          className: "blue",
          name: "Reload",
          icon: mdiRefresh,
          onClick: () => window.location.reload(),
        },
      },
      state: this.clientStatus,
    },
  ])

  sentProductHashes = observable<readonly Hash<Product>[]>([])
  selection = observable<HierarchySelection>()
  products = observable<Product[]>([])
  exportTypes = observable<readonly ExportTypeInfo[]>([])
  paramDef = observable<ObjectParam<any>>()
  params = observable<Record<string, unknown>>({})
  hierarchy = observable<Hierarchy>()
  logs = observable<Promise<Log>[]>([])
  sendParams = false

  productHashes = computed<readonly Hash<Product>[]>(() => {
    const selection = this.selection()
    if(!selection) return this.sentProductHashes()
    const hierarchy = this.hierarchy()
    if(!hierarchy) return []
    return [...resolveHierarchySelection(selection, hierarchy)]
  })

  clientServerMessenger: ClientServerMessenger

  constructor(public connection: Connection<unknown>, public artifactManager: ArtifactManager){
    this.clientServerMessenger = createMessenger({ impl: {}, connection: logConnection(this.connection) })
    this.artifactManager.artifactStores.unshift(this)

    this.productHashes.on("update", async () => {
      this.products(
        await Promise.all(this.productHashes().map(async hash => {
          const product = await this.artifactManager.lookupRaw(hash)
          if(!product)
            throw new Error("Could not find Product under hash of " + hash)
          return product
        })),
      )
    })

    this.clientServerMessenger.on("reload", async () => {
      this.wrapRendering(async () => {
        this.clientServerMessenger.run(this.sendParams ? this.params() : null)
        await this.clientServerMessenger.once("info")
      })
    })

    this.clientServerMessenger.on("bundleStart", async () => {
      this.clientStatus("bundling")
    })

    this.clientServerMessenger.on("bundleFinish", async newBundleHash => {
      this.clientStatus(newBundleHash === await this.bundleHash ? "current" : "reload")
    })

    this.clientServerMessenger.on("info", info => {
      this.handleProducts(info.products)
      this.handleParamDef(info.paramDef)
      this.handleHierarchy(info.hierarchy)
      this.handleConversions(info.conversions)
      this.handleExportTypes(info.exportTypes)
    })

    this.clientServerMessenger.on("log", logHash => {
      if(!logHash)
        return this.logs([])
      this.logs([...this.logs(), (async () => {
        const log = await this.artifactManager.lookupRaw(logHash)
        if(!log)
          throw new Error(`Could not find log under hash of ${logHash}`)
        return log
      })()])
    })
  }

  removeStatusSet(name: string){
    this.statuses(this.statuses().filter(statusSet => statusSet.name !== name))
  }

  addStatusSet(statusSet: StatusSet){
    this.statuses([...this.statuses(), statusSet])
  }

  connect(){
    this.logs([])
    this.clientServerMessenger.emit("reload")
  }

  public async handleProducts(productHashes: Info["products"]){
    this.sentProductHashes(productHashes)
  }

  private async handleExportTypes(exportTypes: Info["exportTypes"]){
    if(exportTypes)
      this.exportTypes(exportTypes)
  }

  private async handleParamDef(paramDefHash: Info["paramDef"]){
    this.paramDef(paramDefHash ? await this.artifactManager.lookupRaw(paramDefHash) : null)
  }

  private async handleHierarchy(hierarchyHash: Info["hierarchy"]){
    this.hierarchy(hierarchyHash ? await this.artifactManager.lookupRaw(hierarchyHash) : null)
  }

  private async handleConversions(conversions: Info["conversions"]){
    for(const [fromType, toType] of conversions ?? [])
      if(!conversionRegistry.has(fromType, toType))
        conversionRegistry.register({
          fromType,
          toType,
          convert: () => {
            throw new Error("Stub conversion erroneously called")
          },
          weight: Infinity,
          id: stubConversionId,
        })
  }

  lookupRawUrl(hash: Hash<unknown>): Promise<string>{
    return this.wrapRendering(() => this.clientServerMessenger.lookupRaw(hash))
  }

  async lookupRaw(hash: Hash<unknown>){
    return this.wrapRendering(async () => {
      const response = await fetch(await this.lookupRawUrl(hash))
      return Buffer.from(await response.arrayBuffer())
    })
  }

  lookupRefUrl(loc: readonly unknown[]): Promise<string>{
    return this.wrapRendering(() => this.clientServerMessenger.lookupRef(loc))
  }

  async lookupRef(loc: readonly unknown[]){
    return this.wrapRendering(async () => {
      const response = await fetch(await this.lookupRefUrl(loc))
      return Buffer.from(await response.arrayBuffer())
    })
  }

  async wrapRendering<T>(fn: () => Promise<T>){
    this.rendererStatus(this.rendererStatus.value + 1)
    const result = await fn()
    this.rendererStatus(this.rendererStatus.value - 1)
    return result
  }

  triggerParamsUpdate = () => {
    this.sendParams = true
    this.clientServerMessenger.emit("reload")
  }

}

export class WebSocketClientState extends ClientState {

  emit: (value: string) => void
  curWs?: WebSocket
  disconnectTimeout: any
  url: string

  constructor(url: string, artifactManager: ArtifactManager){
    const [a, b] = createConnectionPair<string, unknown>()
    b.onMsg(message => this.curWs?.send(message))
    const connection = serializeConnection(a)
    super(connection, artifactManager)
    this.emit = b.send
    this.url = url
    this.initWs()
  }

  async initWs(){
    if(this.curWs) return
    if(this.disconnectTimeout) clearTimeout(this.disconnectTimeout)

    this.serverStatus("connecting")
    await new Promise(r => setTimeout(r, 1000))
    const ws = this.curWs = new WebSocket(this.url)
    ws.addEventListener("open", () => {
      if(this.curWs !== ws)
        return ws.close()
      this.serverStatus("connected")
      this.connect()
    })

    ws.addEventListener("close", () => this.disconnect(ws))
    ws.addEventListener("error", () => this.disconnect(ws))
    ws.addEventListener("message", msg => {
      this.emit(msg.data)
    })
  }

  disconnect(ws: WebSocket){
    ws.close()
    if(ws !== this.curWs)
      return
    this.serverStatus("disconnected")
    this.curWs = undefined
    setTimeout(() => this.initWs(), 5000)
  }

}
