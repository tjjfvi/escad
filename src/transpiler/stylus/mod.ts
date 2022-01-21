import "./_polyfills.ts";

import { restore } from "./_redefineProto.ts";

import * as _stylus from "https://esm.sh/stylus/lib/stylus.js";
import type * as __stylus from "https://cdn.esm.sh/v64/@types/stylus@0.48.36/index.d.ts";

restore();

export const stylus = _stylus as typeof __stylus;

for (let x in stylus.nodes) {
  // @ts-ignore
  if (typeof stylus.nodes[x] === "function") {
    // @ts-ignore
    Object.defineProperty(stylus.nodes[x], "name", { value: x });
  }
}
