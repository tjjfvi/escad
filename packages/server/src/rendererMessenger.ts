
import { ServerRendererMessage, RendererServerMessage, LoadInfo } from "@escad/server-renderer-messages"
import { EventEmitter } from "tsee"
import { fork, ChildProcess } from "child_process";
import watch from "node-watch";
import config from "./config";
import { Hash } from "@escad/core";
import { v4 as uuidv4 } from "uuid";

export class RendererMessenger extends EventEmitter<{
  message: (message: RendererServerMessage) => void,
  loadInfo: (loadInfo: LoadInfo) => void,
}> {

  childProcess: ChildProcess;

  constructor(){
    super();

    this.childProcess = this.reload();
    this.startWatch();

    this.on("message", msg => {
      if(msg.type === "loadResponse")
        this.emit("loadInfo", msg);
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
