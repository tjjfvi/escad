
import { RendererServerMessage, ServerRendererMessage } from "@escad/server-renderer-messages"
import { EventEmitter } from "tsee"

const processSend = (() => {
  const { send: processSend } = process;
  if(processSend)
    return processSend.bind(process);
  throw new Error("@escad/renderer can only be required in a child process");
})()


export class Messenger extends EventEmitter<{
  message: (message: ServerRendererMessage) => void,
}> {

  constructor(){
    super();

    process.on("message", e => {
      this.emit("message", e);
    })
  }

  send(message: RendererServerMessage){
    processSend(message);
  }

}

export const messenger = new Messenger();
