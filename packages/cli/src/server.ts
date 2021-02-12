
import express from "express";
import expressWs from "express-ws";
import { createRendererDispatcher, createServerClientMessenger, createServerRendererMessenger } from "@escad/server";
import { Bundler } from "@escad/client-bundler";
import path from "path";
import { childProcessConnection, createMessenger, filterConnection, mapConnection } from "@escad/messages";
import { writeFile, mkdirp } from "fs-extra";
import { fork } from "child_process";
import watch from "node-watch";

export const createServer = async (artifactsDir: string, port: number, loadFile: string, loadDir: string) => {
  const { app } = expressWs(express());

  const staticDir = path.join(artifactsDir, "static/")
  await mkdirp(staticDir);

  app.use(express.static(staticDir));
  app.use("/artifacts", express.static(artifactsDir + "/"));

  const bundler = new Bundler({
    coreClientPath: require.resolve("./client"),
    outDir: staticDir,
    log: true,
    watch: false,
  });

  const rendererMessenger = createRendererDispatcher(artifactsDir, 3, () => {
    const child = fork(require.resolve("./renderer"));
    return createServerRendererMessenger(
      mapConnection.flatted(filterConnection.string(childProcessConnection(child))),
      artifactsDir,
    );
  });

  rendererMessenger.req.load(loadFile)
  watch(loadDir, {
    filter: file => !file.includes("artifacts") && !file.includes("node_modules") && !file.includes("dist"),
  }, () => {
    rendererMessenger.req.load(loadFile)
  });

  (async function(){
    for await (const { clientPlugins } of rendererMessenger.req.onLoad())
      bundler.updateClientPlugins(clientPlugins);
  })()

  app.ws("/ws", ws => {
    const messenger = createServerClientMessenger(
      mapConnection.flatted(filterConnection.string({
        send: msg => ws.send(msg),
        onMsg: cb => ws.on("message", cb),
        offMsg: cb => ws.off("message", cb),
      })),
      rendererMessenger,
      hash => `/artifacts/raw/${hash}`,
    );
    ws.on("close", () => messenger.destroy());
    ws.on("error", () => messenger.destroy());
  });

  const httpServer = app.listen(port, () => {
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
    console.log(`Listening on ${addressPortString}`);
  });

  writeFile(path.join(staticDir, "index.html"), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>escad</title>
</head>
<body>
  <div id="root"></div>
  <script src="bundle.js"></script>
</body>
</html>
  `.trim());
}
