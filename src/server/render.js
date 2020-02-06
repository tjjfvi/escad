
// Render Process

const escad = require("../core");

let file, func;

process.on("message", ([type, ...data]) => {
  if(type === "run")
    return run(...data);
  if(type !== "init")
    return;

  [file, escad.ProductManager.dir] = data;
  let result;
  try {
    result = require(file);
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
    return console.error(new Error("Invalud return type from exported function"));
  result.tree.visualize();
  if(result instanceof escad.Work || result.isComponent)
    result = await result.process();
  let sha = result.meta.sha;
  process.send(["finish", id, sha, paramDef])
}
