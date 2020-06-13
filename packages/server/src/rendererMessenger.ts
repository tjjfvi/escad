
import { ServerRendererMessage, RendererServerMessage, ClientPluginRegistration } from "@escad/server-renderer-messages"
import { EventEmitter } from "tsee"
import { fork, ChildProcess } from "child_process";
import watch from "node-watch";
import config from "./config";
import { Hex } from "@escad/core";

export class RendererMessenger extends EventEmitter<{
  message: (message: RendererServerMessage) => void,
  shas: (shas: Hex[]) => void,
  clientPlugins: (clientPlugins: ClientPluginRegistration[]) => void,
  paramDef: (paramDef: Hex | null) => void,
}> {

  childProcess: ChildProcess;

  constructor(){
    super();

    this.childProcess = this.reload();
    this.startWatch();

    this.on("message", msg => {
      if(msg[0] === "shas")
        this.emit(...msg);
      if(msg[0] === "clientPlugins")
        this.emit(...msg);
      if(msg[0] === "paramDef")
        this.emit(...msg);
    })
  }

  reload(){
    if(this.childProcess)
      this.childProcess.kill();

    this.childProcess = fork(require.resolve("./loadRenderer"), undefined, {
      execArgv: [...process.execArgv, "--debug-port=2992"],
    });

    this.send("artifactsDir", config.artifactsDir);
    this.send("load", config.loadFile);

    this.childProcess.on("message", message => this.emit("message", message as any));

    return this.childProcess;
  }

  private startWatch(){
    watch(config.loadDir, {
      recursive: true,
      filter: f => !/node_modules|artifacts/.test(f),
    }, () => this.reload());
  }

  send(...message: ServerRendererMessage){
    this.childProcess.send(message);
  }

}

export const rendererMessenger = new RendererMessenger();
