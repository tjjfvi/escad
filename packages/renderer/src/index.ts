
import { ReadonlyArtifactManager, Element, Product } from "@escad/core";
import { messenger } from "./messenger";

messenger.on("message", async message => {
  if(message[0] === "artifactsDir")
    return ReadonlyArtifactManager.setArtifactsDir(message[1]);
  if(message[0] !== "load")
    throw new Error("Invalid message from server");
  const [, path] = message;
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
})
