import { parentWorkerConnection } from "../messages/mod.ts";
import {
  createTranspiler,
  createTranspilerServerMessenger,
} from "../server/transpiler.ts";
import * as path from "../deps/path.ts";

const bundleDir = Deno.env.get("BUNDLE_DIR")!;

export const getTranspiledLocation = (url: string) => path.join(bundleDir, url);

const transpiler = createTranspiler({
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
  transformUrl: (url) => "/" + url,
});

createTranspilerServerMessenger(transpiler, parentWorkerConnection());
