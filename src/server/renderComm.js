
const { fork } = require("child_process");
const uuidv4 = require("uuid/v4");
const watch = require("node-watch");
const ee = new (require("events"))();
const { loadDir, loadFile } = require("./config");

let childProcess = null;

function reload(){
  console.log("Loaded");

  if(childProcess)
    childProcess.kill();

  childProcess = fork(require.resolve("./render"));

  childProcess.send(["init", loadFile, __dirname + "/../../products/"]);

  run().then(({ shas, paramDef, hierarchy }) => {
    ee.emit("reload", { shas, paramDef, hierarchy });
  });
}

async function run(params = null){
  let id = uuidv4();

  childProcess.send(["run", id, params]);

  let res;
  let prom = new Promise(r => res = r);

  let handler = ([type, _id, shas, hierarchy, paramDef]) => {
    if(type !== "finish" || _id !== id)
      return;

    childProcess.removeListener("message", handler);

    res({ shas, paramDef, hierarchy });
  };

  childProcess.on("message", handler);

  return await prom;
}

async function exp(sha, format){
  let id = uuidv4();

  childProcess.send(["export", id, sha, format]);

  let res;
  let prom = new Promise(r => res = r);

  let handler = ([type, _id]) => {
    if(type !== "finish" || _id !== id)
      return;

    childProcess.removeListener("message", handler);

    res();
  };

  childProcess.on("message", handler);

  return await prom;
}

watch(loadDir, { recursive: true, filter: f => !/node_modules|products/.test(f) }, () => reload());
reload();

module.exports = { run, ee, export: exp, exp };
