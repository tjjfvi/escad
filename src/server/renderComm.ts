
import { fork } from "child_process";
import uuidv4 from "uuid/v4";
import watch from "node-watch";
import { EventEmitter } from "tsee";
import config from "./config";

const { loadDir, loadFile, artifactsDir } = config;

const ee = new EventEmitter<{
  reload: (x: any) => void,
}>();

let childProcess = null;

function reload() {
  console.log("Loaded");

  if (childProcess)
    childProcess.kill();

  childProcess = fork(require.resolve("./_render"));

  childProcess.send(["init", loadFile, artifactsDir]);

  run().then(({ shas, paramDef, hierarchy }) => {
    ee.emit("reload", { shas, paramDef, hierarchy });
  });
}

async function run(params = null) {
  let id = uuidv4();

  childProcess.send(["run", id, params]);

  let res;
  let prom = new Promise(r => res = r);

  let handler = ([type, _id, shas, hierarchy, paramDef]) => {
    if (type !== "finish" || _id !== id)
      return;

    childProcess.removeListener("message", handler);

    res({ shas, paramDef, hierarchy });
  };

  childProcess.on("message", handler);

  return await prom;
}

async function exp(sha, format) {
  let id = uuidv4();

  childProcess.send(["export", id, sha, format]);

  let res;
  let prom = new Promise(r => res = r);

  let handler = ([type, _id]) => {
    if (type !== "finish" || _id !== id)
      return;

    childProcess.removeListener("message", handler);

    res();
  };

  childProcess.on("message", handler);

  return await prom;
}

async function proc(sha) {
  let id = uuidv4();

  childProcess.send(["process", id, sha]);

  let res;
  let prom = new Promise(r => res = r);

  let handler = ([type, _id]) => {
    if (type !== "finish" || _id !== id)
      return;

    childProcess.removeListener("message", handler);

    res();
  };

  childProcess.on("message", handler);

  return await prom;
}

watch(loadDir, { recursive: true, filter: f => !/node_modules|artifacts/.test(f) }, () => reload());
reload();

export { run, ee, exp, proc };

