
import config from "./config";
import path from "path";
import { ClientMessenger } from "./clientMessenger";
import { serverId } from "./serverId";
import express from "express";
import expressWs from "express-ws";
import "./rendererMessenger";

const { app } = expressWs(express());

app.use(express.static(path.join(path.dirname(require.resolve("@escad/client")), "dist")));
app.use(express.static(config.artifactsDir));

app.ws("/ws", ws => new ClientMessenger(ws));

const httpServer = app.listen(config.port, () => {
  const address = httpServer.address();
  const addressString = (
    typeof address === "object" ?
      address ?
        `http://${address.address}${address.port}` :
        "<?>" :
      address
  )
  console.log(`Listening on ${addressString}; serverId: ${serverId}`);
});
