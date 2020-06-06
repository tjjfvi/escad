
// Render Process

import escad, { Work, ReadonlyArtifactManager, Element } from "@escad/core";

let file: string, func: any, dir: string,
  init = false;
let queue: any[] = [];

process.on("message", processMessage);

function processMessage([type, ...data]: any){
  if(!init && type !== "init") {
    queue.push([type, ...data]);
    return;
  }
  if(type === "run")
    // @ts-ignore
    return run(...data);
  if(type === "process")
    // @ts-ignore
    return proc(...data);
  if(type !== "init")
    return;

  init = true;
  [file, dir] = data;
  ReadonlyArtifactManager.setArtifactsDir(dir);
  let result;
  try {
    result = require(file).default;
  } catch (e) {
    console.error(e);
  }
  if(typeof result !== "function")
    throw new Error("Expected export type of function, got " + typeof result);
  func = result;
  queue.map(processMessage);
}


async function run(id: any, params: any){
  if(!func)
    return;
  let result;
  let paramDef;
  try {
    result = await func(escad, (def: any) => {
      paramDef = def;
      let defaults: any = {};
      def.map((d: any) => {
        if(d.default)
          defaults[d.key] = d.default;
      });
      return Object.assign(defaults, params);
    });
  } catch (e) {
    console.error(e);
    return;
  }
  if(!result)
    return console.error(new Error("Invalid return type from exported function"));
  console.time("Render")
  let el = new Element(result);
  let hierarchy = el.hierarchy;
  let shas = await Promise.all(el.toArrayFlat().map(async (x: any) => {
    if(!(x instanceof Work))
      throw new Error("Invalid return type from exported function")
    await x.process();
    return x.sha.b64;
  }));
  console.timeEnd("Render")
  process.send?.(["finish", id, shas, hierarchy.sha.b64, paramDef])
}

async function proc(id: any, sha: any){
  let work = await Work.Manager.lookup({ b64: sha } as any);
  if(!work)
    throw new Error();
  await work.process();
  process.send?.(["finish", id, sha]);
}
