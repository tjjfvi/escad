
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


async function run(id){
  if(!func)
    return;
  let result;
  try {
    result = await func(escad);
  } catch (e) {
    console.error(e);
    return;
  }
  if(result instanceof escad.Work || result instanceof escad.Component)
    result = await result.process();
  let sha = result.meta.sha;
  process.send(["finish", id, sha])
}
