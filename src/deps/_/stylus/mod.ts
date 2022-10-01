import "./_polyfills.ts";

import { restore } from "./_redefineProto.ts";

import * as stylus from "https://esm.sh/stylus@0.58.1/lib/stylus.js?target=esnext&pin=v85";
export { stylus };

restore();

for (let x in stylus.nodes) {
  // @ts-ignore
  if (typeof stylus.nodes[x] === "function") {
    // @ts-ignore
    Object.defineProperty(stylus.nodes[x], "name", { value: x });
  }
}
