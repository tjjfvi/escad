
import { ServerRendererMessage, RendererServerMessage } from "@escad/server-renderer-messages"
import { EventEmitter } from "tsee"
import { fork, ChildProcess } from "child_process";
import watch from "node-watch";
import config from "./config";
import { Hash, ProductType } from "@escad/core";
import { PluginRegistration } from "@escad/register-client-plugin";
import { v4 as uuidv4 } from "uuid";

export class RendererMessenger extends EventEmitter<{
  message: (message: RendererServerMessage) => void,
  products: (products: Hash[]) => void,
  registeredConversions: (conversions: [ProductType, ProductType][]) => void,
  clientPlugins: (clientPlugins: PluginRegistration[]) => void,
  paramDef: (paramDef: Hash | null) => void,
}> {

  childProcess: ChildProcess;

  constructor(){
    super();

    this.childProcess = this.reload();
    this.startWatch();

    this.on("message", msg => {
      if(msg.type === "products")
        this.emit("products", msg.products);
      if(msg.type === "registeredConversions")
        this.emit("registeredConversions", msg.conversions);
      if(msg.type === "clientPlugins")
        this.emit("clientPlugins", msg.plugins);
      if(msg.type === "paramDef")
        this.emit("paramDef", msg.paramDef);
    })
  }

  reload(){
    if(this.childProcess)
      this.childProcess.kill();

    this.childProcess = fork(require.resolve("./loadRenderer"), undefined, {
      execArgv: [...process.execArgv, "--debug-port=2992"],
    });

    this.send({ type: "artifactsDir",  artifactsDir: config.artifactsDir });
    this.send({ type: "load", path: config.loadFile });

    this.childProcess.on("message", message => this.emit("message", message as any));

    return this.childProcess;
  }

  private startWatch(){
    watch(config.loadDir, {
      recursive: true,
      filter: f => !/node_modules|artifacts/.test(f),
    }, () => this.reload());
  }

  send(message: ServerRendererMessage){
    this.childProcess.send(message);
  }

  lookupRef(loc: readonly unknown[]){
    return new Promise<Hash>(resolve => {
      const id = uuidv4();
      this.send({ type: "lookupRef", id, loc })
      const handler = (message: RendererServerMessage) => {
        if(message.type !== "lookupRefResponse" || message.id !== id)
          return;
        resolve(message.hash)
        this.removeListener("message", handler);
      }
      this.on("message", handler);
    })
  }

}

export const rendererMessenger = new RendererMessenger();
