import { brandConnection, parentWorkerConnection } from "../messages/mod.ts";
import {
  createTranspiler,
  createTranspilerServerMessenger,
} from "../transpiler/mod.ts";
import { transformUrl } from "../transpiler/transformUrl.ts";
import { getTranspiledUrl } from "./getTranspiledUrl.ts";
import { put } from "./swApi.ts";

const transpiler = createTranspiler({
  cache: {
    has: async (url) => {
      return (await fetch(`/transpiled/${transformUrl(url)}`)).ok;
    },
    set: async (url, content) => {
      await put(
        getTranspiledUrl(url).slice((location.origin + "/").length),
        content,
      );
    },
  },
  transformUrl: getTranspiledUrl,
});

createTranspilerServerMessenger(
  transpiler,
  brandConnection(parentWorkerConnection(), "a"),
);

createTranspilerServerMessenger(
  transpiler,
  brandConnection(parentWorkerConnection(), "b"),
);
