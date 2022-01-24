import "./_polyfills.ts";

import { restore } from "./_redefineProto.ts";

// @deno-types="https://esm.sh/@types/stylus@0.48.36/index.d.ts";
import * as stylus from "https://esm.sh/stylus/lib/stylus.js";
export { stylus };

restore();

for (let x in stylus.nodes) {
  // @ts-ignore
  if (typeof stylus.nodes[x] === "function") {
    // @ts-ignore
    Object.defineProperty(stylus.nodes[x], "name", { value: x });
  }
}
