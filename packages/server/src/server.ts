
import config from "./config";
import path from "path";
import { ClientMessenger } from "./clientMessenger";
import { serverId } from "./serverId";
import express from "express";
import expressWs from "express-ws";
import "./rendererMessenger";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { rendererMessenger } from "./rendererMessenger";
import { Hex } from "@escad/core";

const { app } = expressWs(express());

app.use(express.static(path.join(path.dirname(require.resolve("@escad/client")), "dist")));
app.use(express.static(config.artifactsDir));

app.get("/exportTypes/:productTypeId/", async (req, res) => {
  const { productTypeId } = req.params;
  const shas = await fs.readdir(path.join(config.artifactsDir, "exportTypes", productTypeId));
  res.send(JSON.stringify(shas));
})

app.get("/exports/:exportTypeId/:productSha", (req, res) => {
  const requestId = uuidv4();
  const { exportTypeId, productShaExt } = req.params;
  const productSha = productShaExt.split(".")[0];
  rendererMessenger.send("export", requestId, exportTypeId as Hex, productSha as Hex);
  rendererMessenger.on("message", message => {
    if(message[0] === "exportFinish" && message[1] === requestId)
      fs.createReadStream(path.join(config.artifactsDir, "exports", exportTypeId, productSha)).pipe(res);
  })
})

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
