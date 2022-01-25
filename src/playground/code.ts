import { instanceId } from "./instanceId.ts";
import { transpiler } from "./transpiler.ts";
import { putVfs } from "./vfs.ts";
import { lzstring } from "../deps/lzstring.ts";

const defaultCode = `
import escad from "${location.origin}/core/mod.ts";
import "${location.origin}/builtins/register.ts";

export default () =>
  escad
    .cube({ size: 1 })
    .sub(escad.cube({ size: .9 }))
    .sub(escad.cube({ size: 1, shift: 1 }))
`;

export let code = await getInitialCode();

await setCode(code);

export async function setCode(_code: string) {
  code = _code;
  localStorage.code = code;
  await putVfs(`${instanceId}/main.ts`, code);
  await transpiler.transpile(
    new URL(`/vfs/${instanceId}/main.ts`, import.meta.url).toString(),
    true,
  );
}

export async function share() {
  const response = await fetch("https://api.escad.run/create", {
    method: "POST",
    body: JSON.stringify({
      code,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error(response);
    return null;
  }
  const { short } = await response.json() as { short: string };
  window.location;
  history.pushState({}, "Playground", "#" + short);
  return window.location.toString();
}

async function getInitialCode() {
  if (window.location.hash) {
    let response = await fetch(
      "https://api.escad.run/" + window.location.hash.slice(1) + ".ts",
    );
    if (response.ok) return await response.text();
  }
  return defaultCode;
}
