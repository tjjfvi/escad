
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
      products: await render(params),
      paramDef: paramHash,
    });

  console.time("Load")

  messenger.send({
    type: "loadResponse",
    products: await render(defaultParams),
    conversions: [...conversionRegistry.listAll()].map(x => [x.fromType, x.toType]),
    paramDef: paramHash,
    clientPlugins: registeredPlugins,
  });

  console.timeEnd("Load")

  async function render(params: unknown){
    let result;
    try {
      result = await func(params);
    } catch (e) {
      console.error(e);
      return [];
    }
    if(!result) {
      console.error(new Error("Invalid return type from exported function"));
      return [];
    }
    const el = new Element<Product>(result);
    const shas = await Promise.all(el.toArrayFlat().map(async product => {
      await artifactManager.storeRaw(product);
      return hash(product);
    }));
    return shas;
  }
}
