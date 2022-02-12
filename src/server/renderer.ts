import {
  $wrappedValue,
  artifactManager,
  contextStack,
  ConversionRegistry,
  Element,
  ExportTypeRegistry,
  exportTypeRegistry,
  Hash,
  Hierarchy,
  Logger,
  ObjectParam,
  Product,
  ProductType,
} from "../core/mod.ts";
import {
  LoadFileInfo,
  RendererServerMessenger,
  RenderInfo,
} from "./protocol/server-renderer.ts";
import { Connection, createMessenger } from "../messages/mod.ts";
import { registeredPlugins } from "./registerClientPlugin.ts";
import { HashProduct } from "../core/mod.ts";

export const createRendererServerMessenger = (
  connection: Connection<unknown>,
  requireFile: () => Promise<unknown>,
  logger: Logger,
) => {
  const messenger: RendererServerMessenger = createMessenger({
    impl: {
      run,
      loadFile,
      lookupRef,
    },
    connection,
  });

  artifactManager.artifactStores.push({
    lookupRaw: async (hash) => {
      const result = await messenger.lookupRaw(hash);
      if (!result) return null;
      return $wrappedValue.deserialize(result);
    },
  });

  let lastEmitLogPromise: Promise<unknown> = Promise.resolve();
  logger.onLog(async (log) => {
    console.log(log);
    if (!log) {
      lastEmitLogPromise = lastEmitLogPromise.then(() => {
        messenger.emit("log", null);
      });
    } else {
      // Preserves log ordering and avoids race conditions where
      // the client requests the log before the file is written
      const [hash] = await (lastEmitLogPromise = Promise.all([
        artifactManager.storeRaw(log),
        lastEmitLogPromise,
      ]));
      messenger.emit("log", hash);
    }
  });

  return messenger;

  async function run(params?: unknown) {
    messenger.emit("renderStart");
    logger.clear();

    const loadInfo: LoadFileInfo = await loadFile();

    const { func, paramDef } = loadInfo;
    const { defaultValue: defaultParams } = paramDef;
    const paramDefHash = paramDef ? artifactManager.storeRaw(paramDef) : null;

    const renderParams = params ?? defaultParams;
    console.log(
      `Rendering with ${
        renderParams === defaultParams ? "default" : "custom"
      } params:`,
    );
    console.log(renderParams);
    const { products, hierarchy } = await render(renderParams);
    console.log("Rendered");

    const renderInfo: RenderInfo = {
      ...loadInfo,
      paramDef: await paramDefHash,
      products,
      hierarchy,
    };
    messenger.emit("renderFinish");

    return renderInfo;

    async function render(params: unknown) {
      let result;
      try {
        result = await contextStack.wrap(() => func(params as never));
      } catch (e) {
        console.error(e);
        return { products: [], hierarchy: null };
      }
      if (!result) {
        console.error(new Error("Invalid return type from exported function"));
        return { products: [], hierarchy: null };
      }
      const el = Element.create<Product>(result);
      const [products, hierarchy] = await Promise.all([
        Element.toArrayFlat(el).then((products) =>
          Promise.all(
            products.map(async (product) =>
              artifactManager.storeRaw(HashProduct.fromProduct(product))
            ),
          )
        ),
        Hierarchy.from(el).then((hierarchy) =>
          artifactManager.storeRaw(hierarchy)
        ),
      ]);
      return { products, hierarchy };
    }
  }

  async function loadFile() {
    const fullExported = await requireFile();

    if (
      typeof fullExported !== "object" || !fullExported ||
      !("default" in fullExported)
    ) {
      throw new Error("File has no default export");
    }

    const exported = fullExported["default" as never] as unknown;

    if (
      typeof exported !== "function"
    ) {
      throw new Error("Expected default export of type function");
    }

    const func = exported;
    const _paramDef = (exported as any).paramDef;
    const paramDef = ObjectParam.create(_paramDef ?? {});

    const exportTypes = [...exportTypeRegistry.listRegistered()].map((x) => ({
      ...x,
      export: undefined,
      productType: ProductType.fromProductTypeish(x.productType),
    }));

    const loadInfo: LoadFileInfo = {
      paramDef,
      clientPlugins: [...registeredPlugins],
      exportTypes,
      func,
    };

    return loadInfo;
  }
};

async function lookupRef(locHashes: readonly Hash<unknown>[]) {
  console.log(locHashes);
  const loc = await Promise.all(
    locHashes.map((hash) => artifactManager.lookupRaw(hash)),
  );
  console.log(loc);
  const type = getRefType(loc);
  const timerName = type
    ? `${type} ${Hash.create(loc).slice(0, 16)}...`
    : undefined;
  if (type) console.time(timerName);
  const artifact = await artifactManager.lookupRef(loc);
  const artifactHash = await artifactManager.storeRaw(artifact);
  if (type) console.timeEnd(timerName);
  return artifactHash;
}

function getRefType(loc: readonly unknown[]): string | undefined {
  if (loc[0] === ConversionRegistry.artifactStoreId) {
    return Product.isProduct(loc[2]) ? "Convert" : "Compose";
  }
  if (loc[0] === ExportTypeRegistry.artifactStoreId) {
    return "Export";
  }
}
