
import { ReadonlyArtifactManager, Element, Product, ExportType, Id, Sha } from "@escad/core";
import { messenger } from "./messenger";
import { ServerRendererMessage, ClientPluginRegistration } from "@escad/server-renderer-messages";
import { registeredPlugins } from "@escad/register-client-plugin"
import { RenderFunction } from "./renderFunction";
import { ObjectParam } from "@escad/parameters";
import { Serializer } from "tszer"

messenger.on("message", message => {
  if(message[0] === "artifactsDir")
    return ReadonlyArtifactManager.setArtifactsDir(message[1]);
  if(message[0] === "load")
    return load(message[1]);
  if(message[0] === "export")
    return exp(...message);
  if(message[0] === "run")
    return run(message[1], message[2]);
})

let run: (id: string, buffer: Buffer) => void;

async function exp(...message: ServerRendererMessage){
  if(message[0] !== "export")
    throw new Error("418");
  const [, requestId, exportTypeHex, productHex] = message;

  const productSha = new Sha(productHex);
  const product = await Product.Manager.lookup(new Sha(productHex));
  if(!product)
    throw new Error("Invalid product sha given to renderer export");

  const exportTypeId = Id.get(new Sha(exportTypeHex));
  if(!exportTypeId)
    throw new Error("Invalid id given to renderer export");

  const exportType = ExportType.Registry.get(product?.type, exportTypeId);

  await exportType.manager.store(productSha, Promise.resolve(product));

  messenger.send("exportFinish", requestId);
}

async function load(path: string){
  const exported = require(path).default;

  if(typeof exported !== "function" && !(exported instanceof RenderFunction))
    throw new Error("Expected export type of function or RenderFunction");

  const [func, paramDef] = exported instanceof RenderFunction ? [exported.func, exported.paramDef] : [exported, null];
  const param = new ObjectParam({ children: paramDef ?? {} });
  const { defaultValue } = param;

  if(paramDef)
    param.writePromise?.then(() => messenger.send("paramDef", paramDef ? param.sha.hex : null));
  else
    messenger.send("paramDef", null);

  messenger.send("clientPlugins", registeredPlugins.map<ClientPluginRegistration>(registration => ({
    ...registration,
    idMap: Object.entries(registration.idMap).map(([k, id]) => [k, id.sha.hex]),
  })))

  run = async (id, buf) => {
    let result;
    try {
      await func(await Serializer.deserialize(param.valueSerializer(), buf));
      result = await func(defaultValue);
    } catch (e) {
      console.error(e);
      return;
    }
    if(!result)
      return console.error(new Error("Invalid return type from exported function"));
    let el = new Element<Product>(result);
    let shas = await Promise.all(el.toArrayFlat().map(async x => {
      await x.process();
      return x.sha.hex;
    }));
    messenger.send("runFinish", id, shas);
  }

  console.time("Render")

  let result;
  try {
    result = await func(defaultValue);
  } catch (e) {
    console.error(e);
    return;
  }

  if(!result)
    return console.error(new Error("Invalid return type from exported function"));
  let el = new Element<Product>(result);
  let shas = await Promise.all(el.toArrayFlat().map(async x => {
    await x.process();
    return x.sha.hex;
  }));
  messenger.send("shas", shas);

  console.timeEnd("Render")
}

export * from "./renderFunction";
