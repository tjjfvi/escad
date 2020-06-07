
import { ReadonlyArtifactManager, Element, Product, ExportType, Id, Sha } from "@escad/core";
import { messenger } from "./messenger";
import { ServerRendererMessage } from "@escad/server-renderer-messages";

messenger.on("message", message => {
  if(message[0] === "artifactsDir")
    return ReadonlyArtifactManager.setArtifactsDir(message[1]);
  if(message[0] === "load")
    return load(message[1]);
  if(message[0] === "export")
    return exp(...message);
})

async function exp(...message: ServerRendererMessage){
  if(message[0] !== "export")
    throw new Error("418");
  const [, requestId, exportTypeB64, productB64] = message;

  const productSha = new Sha(productB64);
  const product = await Product.Manager.lookup(new Sha(productB64));
  if(!product)
    throw new Error("Invalid product sha given to renderer export");

  const exportTypeId = Id.get(new Sha(exportTypeB64));
  if(!exportTypeId)
    throw new Error("Invalid id given to renderer export");

  const exportType = ExportType.Registry.get(product?.type, exportTypeId);

  await exportType.manager.store(productSha, Promise.resolve(product));

  messenger.send("exportFinish", requestId);
}

async function load(path: string){
  const func = require(path).default;
  if(typeof func !== "function")
    throw new Error("Expected export type of function, got " + typeof func);
  console.time("Render")
  let result;
  try {
    result = await func();
  } catch (e) {
    console.error(e);
    return;
  }
  if(!result)
    return console.error(new Error("Invalid return type from exported function"));
  let el = new Element<Product>(result);
  let shas = await Promise.all(el.toArrayFlat().map(async x => {
    await x.process();
    return x.sha.b64;
  }));
  messenger.send("shas", shas);
  console.timeEnd("Render")
}
