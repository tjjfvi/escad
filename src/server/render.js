
// Render Process

import escad from "../core";
import arrayish from "../core/arrayish";
import Hierarchy from "../core/Hierarchy";
import ProductManager from "../core/ProductManager";
import Work from "../core/Work";

let file, func, dir;

process.on("message", ([type, ...data]) => {
  if(type === "run")
    return run(...data);
  if(type === "export")
    return exp(...data);
  if(type === "process")
    return proc(...data);
  if(type !== "init")
    return;

  [file, dir] = data;
  Work.dir = dir + "/trees/";
  ProductManager.dir = dir + "/products/";
  ProductManager.exportDir = dir + "/exports/";
  let result;
  try {
    result = require(file).default;
  } catch (e) {
    console.error(e);
  }
  if(typeof result !== "function")
    throw new Error("Expected export type of function, got " + typeof result);
  func = result;
})


async function run(id, params){
  if(!func)
    return;
  let result;
  let paramDef;
  try {
    result = await func(escad, def => {
      paramDef = def;
      let defaults = {};
      def.map(d => {
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
  let hierarchy = new Hierarchy(null, result);
  hierarchy.log();
  let shas = (await Promise.all([arrayish.toArrayDeep(result, async x => {
    if(!(x instanceof escad.Work))
      throw new Error("Invalid return type from exported function")
    await x.process(true);
    return x.shaB64;
  })].flat()));
  console.timeEnd("Render")
  process.send(["finish", id, shas, hierarchy, paramDef])
}

async function exp(id, sha, format){
  await ProductManager.export(sha, format);
  process.send(["finish", id]);
}

async function proc(id, sha){
  let work = await Work.deserialize(sha);
  await work.process(true);
  process.send(["finish", id, sha]);
}
