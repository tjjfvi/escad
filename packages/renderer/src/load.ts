
import { artifactManager, hash, Product, Element, conversionRegistry, timers, exportTypeRegistry } from "@escad/core";
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
  const paramHash = paramDef ? hash(param) : null;

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
    exportTypes: [...exportTypeRegistry.listRegistered()],
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
    const shas = await Promise.all(el.toArrayFlat().map(p => artifactManager.storeRaw(p)));
    const r = { products: shas, hierarchy: await artifactManager.storeRaw(el.hierarchy) };
    console.log(timers)
    return r;
  }
}
