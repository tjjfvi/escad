
import fs from "fs";
import flatted from "flatted";
import config from "./config";
import path from "path";

import express from "express";
import expressWs from "express-ws";
const { app } = expressWs(express());

app.use(express.static(path.join(path.dirname(require.resolve("@escad/client")), "dist")));
app.use(express.static(config.artifactsDir));

import { v4 as uuidv4 } from "uuid";
const serverId = uuidv4();
import * as render from "./renderComm";

let curShas: any;
let curParamDef: any;
let curHierarchy: any;

render.ee.on("reload", ({ shas, paramDef, hierarchy }) => {
  curShas = shas;
  curParamDef = paramDef;
  curHierarchy = hierarchy;
});

app.get("/products/:sha", async (req, res) => {
  const { sha } = req.params;

  await render.proc(sha);

  fs.createReadStream(__dirname + "/../../artifacts/products/" + sha).pipe(res);
});

app.ws("/ws", ws => {
  (async () => {

    const s = function (...data: Array<any>) {
      if (ws.readyState !== 1)
        return;
      ws.send(flatted.stringify(data));
    };

    let [requestedId, oldServerId, params] = await new Promise(res =>
      ws.once("message", msg => {
        let [type, ...data] = flatted.parse(msg);

        if (type === "init")
          return res(data);

        ws.close();
      })
    );

    let id: any;

    if (requestedId && oldServerId === serverId) {
      id = requestedId;
      console.log("Client reattached; id:", id);
    } else {
      id = uuidv4();
      params = null;
      console.log("Client attached; id:", id);
    }

    // @ts-ignore
    ws.id = id;

    s("init", id, serverId)

    if (params)
      run();
    else if (curShas) {
      s("shas", curShas);
      s("paramDef", curParamDef);
      s("hierarchy", curHierarchy);
    }

    let interval = setInterval(() => s("ping"), 1000);

    let handler = ({ shas, paramDef, hierarchy }: any) => {
      if (params)
        return run();
      s("shas", shas)
      s("paramDef", paramDef);
      s("hierarchy", hierarchy);
    };
    render.ee.on("reload", handler);

    ws.on("message", msg => {
      let [type, ...data] = flatted.parse(msg.toString());

      if (type !== "params")
        return;

      let [p] = data;

      if (p === null && params === null)
        return;

      params = p;

      if (p !== null)
        return run();

      s("shas", curShas);
      s("paramDef", curParamDef);
      s("hierarchy", curHierarchy);
    })

    ws.on("close", () => {
      clearInterval(interval);
      render.ee.removeListener("reload", handler);
      console.log("Client detached, id:", id);
    });

    async function run() {
      // @ts-ignore
      let { shas, paramDef, hierarchy } = await render.run(params);
      s("shas", shas);
      s("paramDef", paramDef);
      s("hierarchy", hierarchy);
    }
  })().catch(e => console.error(e));
});

const httpServer = app.listen(config.port, () => {
  // @ts-ignore
  console.log(`Listening on http://localhost:${httpServer.address().port}; serverId: ${serverId}`);
});
