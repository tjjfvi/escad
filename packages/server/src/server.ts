
import config from "./config";
import path from "path";
import { ClientMessenger } from "./clientMessenger";
import { serverId } from "./serverId";
import express from "express";
import expressWs from "express-ws";
import "./rendererMessenger";
import { rendererMessenger } from "./rendererMessenger";
import { Bundler } from "@escad/client-bundler";

const { app } = expressWs(express());

const staticDir = path.join(__dirname, "../static/")

app.use(express.static(staticDir));
app.use(express.static(config.artifactsDir));

const bundler = new Bundler({
  coreClientPath: require.resolve("@escad/client"),
  outDir: staticDir,
  log: true,
  watch: false,
});

rendererMessenger.on("clientPlugins", clientPlugins => bundler.updateClientPlugins(clientPlugins));

app.ws("/ws", ws => new ClientMessenger(ws));

const httpServer = app.listen(config.port, () => {
  const address = httpServer.address();
  const addressString =
    typeof address === "object" && address ?
      address.family === "IPv6" ?
        `[${address.address}]` :
        address.address :
      "<?>"
  const addressPortString = (
    typeof address === "object" ?
      address ?
        `http://${addressString}:${address.port}` :
        "<?>" :
      address
  )
  console.log(`Listening on ${addressPortString}; serverId: ${serverId}`);
});
