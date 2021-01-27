
import { artifactManager, hash, Product, Element, conversionRegistry } from "@escad/core";
import { ObjectParam } from "@escad/parameters";
import { registeredPlugins } from "@escad/register-client-plugin";
import { ServerRendererMessage } from "@escad/server-renderer-messages";
import { RenderFunction } from "./renderFunction";
import { messenger } from "./messenger";

export let run: (id: string, params: unknown) => void;

export async function load({ path }: ServerRendererMessage.Load){
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const exported = require(path).default;

  if(typeof exported !== "function" && !(exported instanceof RenderFunction))
    throw new Error("Expected export type of function or RenderFunction");

  const [func, paramDef] = exported instanceof RenderFunction ? [exported.func, exported.paramDef] : [exported, null];
  const param = ObjectParam.create(paramDef ?? {});
  const { defaultValue: defaultParams } = param;
  const paramHash = param ? hash(param) : null;

  if(paramDef)
    artifactManager.storeRaw(param);

  run = async (id, params) =>
    messenger.send({
      type: "runResponse",
      id,
      paramDef: paramHash,
      ...(await render(params)),
    });

  console.time("Load")

  messenger.send({
    type: "loadResponse",
    conversions: [...conversionRegistry.listAll()].map(x => [x.fromType, x.toType]),
    paramDef: paramHash,
    clientPlugins: registeredPlugins,
    ...(await render(defaultParams)),
  });

  console.timeEnd("Load")

  async function render(params: unknown){
    let result;
    try {
      result = await func(params);
    } catch (e) {
      console.error(e);
      return { products: [], hierarchy: null };
    }
    if(!result) {
      console.error(new Error("Invalid return type from exported function"));
      return { products: [], hierarchy: null };
    }
    const el = new Element<Product>(result);
    const shas = await Promise.all(el.toArrayFlat().map(async product => {
      await artifactManager.storeRaw(product);
      return hash(product);
    }));
    await artifactManager.storeRaw(el.hierarchy);
    return { products: shas, hierarchy: hash(el.hierarchy) };
  }
}
