
require("./bundler.js");

const express = require("express");
const app = express();
require("express-ws")(app);

app.use(express.static(__dirname + "/../client/"));

const uuidv4 = require("uuid/v4");
const serverId = uuidv4();
const config = require("./config");

app.ws("/ws", ws => {
  (async () => {

    ws.s = function(...data){
      this.send(JSON.stringify(data));
    };

    let [requestedId, oldServerId] = await new Promise(res =>
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
      console.log("Client attached; id:", id);
    }

    ws.id = id;

    ws.s("init", id, serverId)

    let interval = setInterval(() => ws.s("ping"), 1000);

    ws.on("message", msg => {
      let [type, ...data] = JSON.parse(msg);
      type;
      data;
    })

    ws.on("close", () => {
      clearInterval(interval);
      console.log("Client detached, id:", id);
    });

  })().catch(e => console.error(e));
});

const httpServer = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${httpServer.address().port}; serverId: ${serverId}`);
});
