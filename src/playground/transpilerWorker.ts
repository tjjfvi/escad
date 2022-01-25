import { brandConnection, parentWorkerConnection } from "../messages/mod.ts";
import {
  createTranspilerServerMessenger,
  TranspileContext,
} from "../transpiler/mod.ts";
import { putVfs } from "./vfs.ts";

const transpileContext: TranspileContext = {
  memo: new Map(),
  cache: {
    has: async (url) => {
      if (url.startsWith(window.origin)) return false;
      return (await fetch(`/vfs/${url}`)).ok;
    },
    set: putVfs,
  },
  transformUrl: (url) =>
    new URL(`/vfs/${url}`, window.location.toString()).toString(),
};

createTranspilerServerMessenger(
  transpileContext,
  brandConnection(parentWorkerConnection(), "a"),
);
createTranspilerServerMessenger(
  transpileContext,
  brandConnection(parentWorkerConnection(), "b"),
);
