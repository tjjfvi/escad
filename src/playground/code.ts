export {};
// import { clientId } from "./swApi.ts";
// import { transpiler } from "./transpiler.ts";
// import { put } from "./swApi.ts";

// export let code = await getInitialCode();

// await setCode(code);

// export async function setCode(_code: string) {
//   code = _code;
//   localStorage.code = code;
//   await put(`${clientId}/main.ts`, code);
//   await transpiler.transpile(
//     new URL(`/${clientId}/main.ts`, import.meta.url).toString(),
//     true,
//   );
// }

// export async function share() {
//   const response = await fetch("https://api.escad.run/create", {
//     method: "POST",
//     body: JSON.stringify({
//       code,
//     }),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   if (!response.ok) {
//     console.error(response);
//     return null;
//   }
//   const { short } = await response.json() as { short: string };
//   window.location;
//   history.pushState({}, "Playground", "#" + short);
//   return window.location.toString();
// }

// async function getInitialCode() {
//   if (window.location.hash) {
//     let response = await fetch(
//       "https://api.escad.run/" + window.location.hash.slice(1) + ".ts",
//     );
//     if (response.ok) return await response.text();
//   }
//   return defaultCode;
// }
