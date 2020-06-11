
import { EventEmitter } from "tsee";
import flatted from "flatted";
import { ServerClientMessage, ClientServerMessage } from "@escad/server-client-messages"
import { observable, computed } from "rhobo";
import { Product } from "./Product";
import { Id } from "./Id";

export class Messenger extends EventEmitter<{
  message: (message: ServerClientMessage) => void,
}> {

  ws: WebSocket | null;
  connected = observable<boolean>(false);
  id = observable<string>();
  serverId = observable<string>();
  shas = observable<Array<string>>([]);
  products = computed<Promise<Product>[]>(() => this.shas().map(async (sha): Promise<Product> => {
    const buf = Buffer.from(await fetch(`/products/${sha}`).then(r => r.arrayBuffer()));
    const idBuf = buf.slice(0, 32);
    const id = Id.get(idBuf.toString("hex"));
    const data = buf.slice(32);
    return {
      sha,
      type: id,
      buffer: data,
    };
  }));

  disconnectTimeout: any;

  constructor(public url: string){
    super();
    this.ws = this.initWs();
    this.on("message", msg => {
      if(msg[0] === "init") {
        this.id(msg[1]);
        this.serverId(msg[2]);
        return;
      }

      if(msg[0] === "shas")
        return this.shas(msg[1]);
    })
  }

  send(...message: ClientServerMessage){
    console.log("→", ...message);
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
      this.send("init", this.id(), this.serverId());
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

      if(message[0] === "ping")
        return;

      this.emit("message", message);

      console.log("←", ...message);
    })

    return this.ws;
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

export const messenger = new Messenger("ws" + window.location.toString().slice(4) + "ws/");
