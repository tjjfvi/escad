import { createServer as _createServer } from "../server/mod.ts";
import {
  brandConnection,
  createMessenger,
  workerConnection,
} from "../messages/mod.ts";
import { ServerTranspilerMessenger } from "../protocol/mod.ts";
import { putVfs } from "./vfs.ts";
import { instanceId } from "./instanceId.ts";

export const transpilerConnection = workerConnection(
  worker("./transpilerWorker.js"),
);

export const transpiler: ServerTranspilerMessenger = createMessenger({
  impl: {},
  connection: brandConnection(transpilerConnection, "a"),
});

export let code = `
import escad from "${location.origin}/core/mod.ts";
import "${location.origin}/builtins/register.ts";

export default () =>
  escad
    .cube({ size: 1 })
    .sub(escad.cube({ size: .9 }))
    .sub(escad.cube({ size: 1, shift: 1 }))
`;

await setCode(code);

export async function setCode(code: string) {
  localStorage.code = code;
  await putVfs(`${instanceId}/main.ts`, code);
  await transpiler.transpile(
    new URL(`/vfs/${instanceId}/main.ts`, import.meta.url).toString(),
    true,
  );
}

function worker(relativePath: string) {
  let url = new URL(relativePath, import.meta.url).toString();
  return new Worker(url, { type: "module" });
}
