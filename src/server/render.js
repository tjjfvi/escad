
// Render Process

const escad = require("../core");
const arrayish = require("../core/arrayish");

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
  let shas = (await Promise.all(arrayish.toArrayDeep(result, async x => {
    if(x instanceof escad.Work)
      return await x.process();
    return x;
  }))).map(r => r.meta.sha);
  console.log(shas.join("\n"))
  process.send(["finish", id, shas, paramDef])
}
