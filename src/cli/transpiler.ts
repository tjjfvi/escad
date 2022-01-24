import { parentWorkerConnection } from "../messages/mod.ts";
import {
  createTranspilerServerMessenger,
  TranspileContext,
} from "../transpiler/mod.ts";
import { getTranspiledUrl, replaceTsExtension } from "./serverTranspiler.ts";
import * as path from "../deps/path.ts";

const bundleDir = Deno.env.get("BUNDLE_DIR")!;

export const getTranspiledLocation = (url: string) =>
  replaceTsExtension(path.join(bundleDir, url));

const transpileContext: TranspileContext = {
  memo: new Map(),
  cache: {
    has: async (url) => {
      try {
        await Deno.lstat(getTranspiledLocation(url));
        return true;
      } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
          return false;
        } else {
          throw e;
        }
      }
    },
    set: async (url, result) => {
      let loc = getTranspiledLocation(url);
      await Deno.mkdir(path.dirname(loc), { recursive: true });
      await Deno.writeTextFile(loc, result);
    },
  },
  transformUrl: getTranspiledUrl,
};

createTranspilerServerMessenger(transpileContext, parentWorkerConnection());
