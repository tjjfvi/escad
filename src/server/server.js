
require("./bundler.js");

const express = require("express");
const app = express();
require("express-ws")(app);

app.use(express.static(__dirname + "/../client/"));
app.use("/product/", express.static(__dirname + "/../../products/"));

const uuidv4 = require("uuid/v4");
const serverId = uuidv4();
const config = require("./config");
const render = require("./renderComm");

let curShas;
let curParamDef;
let curHierarchy;

render.ee.on("reload", ({ shas, paramDef, hierarchy }) => {
  curShas = shas;
  curParamDef = paramDef;
  curHierarchy = hierarchy;
});

app.ws("/ws", ws => {
  (async () => {

    ws.s = function(...data){
      if(ws.readyState !== 1)
        return;
      this.send(JSON.stringify(data));
    };

    let [requestedId, oldServerId, params] = await new Promise(res =>
      ws.once("message", msg => {
        let [type, ...data] = JSON.parse(msg);

        if(type === "init")
          return res(data);

        ws.close();
      })
    );

    let id;

    if(requestedId && oldServerId === serverId) {
      id = requestedId;
      console.log("Client reattached; id:", id);
    } else {
      id = uuidv4();
      params = null;
      console.log("Client attached; id:", id);
    }

    ws.id = id;

    ws.s("init", id, serverId)

    if(params)
      run();
    else if(curShas) {
      ws.s("shas", curShas);
      ws.s("paramDef", curParamDef);
      ws.s("hierarchy", curHierarchy);
    }

    let interval = setInterval(() => ws.s("ping"), 1000);

    let handler = ({ shas, paramDef, hierarchy }) => {
      if(params)
        return run();
      ws.s("shas", shas)
      ws.s("paramDef", paramDef);
      ws.s("hierarchy", hierarchy);
    };
    render.ee.on("reload", handler);

    ws.on("message", msg => {
      let [type, ...data] = JSON.parse(msg);

      if(type !== "params")
        return;

      let [p] = data;

      if(p === null && params === null)
        return;

      params = p;

      if(p !== null)
        return run();

      ws.s("shas", curShas);
      ws.s("paramDef", curParamDef);
      ws.s("hierarchy", curHierarchy);
    })

    ws.on("close", () => {
      clearInterval(interval);
      render.ee.removeListener("reload", handler);
      console.log("Client detached, id:", id);
    });

    async function run(){
      let { shas, paramDef, hierarchy } = await render.run(params);
      ws.s("shas", shas);
      ws.s("paramDef", paramDef);
      ws.s("hierarchy", hierarchy);
    }
  })().catch(e => console.error(e));
});

const httpServer = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${httpServer.address().port}; serverId: ${serverId}`);
});
