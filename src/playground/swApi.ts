import { contentType as getContentType } from "../deps/media_types.ts";

if (typeof window !== "undefined" && window.parent === window) {
  let reg = await navigator.serviceWorker.register(
    new URL("/sw.js", import.meta.url),
    {
      scope: "/",
    },
  );

  console.log(reg);

  let sw = reg.installing ?? reg.active;

  if (!sw) throw new Error("Missing service worker");

  let p = new Promise<void>((r) =>
    navigator.serviceWorker.addEventListener("message", (_ev) => {
      r();
    })
  );
  sw.postMessage("ping");
  await p;

  console.log(sw);
}

const clientIdResponse = await fetch("/sw/clientId");
if (!clientIdResponse.ok) throw clientIdResponse;
export const clientId = await clientIdResponse.text();

export async function put(
  path: string,
  content: BodyInit,
  contentType = getContentType("." + path.split(".").slice(-1)[0]) ??
    "text/plain",
) {
  if (path.startsWith("/")) path = path.slice(1);
  await fetch(`/sw/${path}`, {
    method: "PUT",
    body: content,
    headers: {
      "Content-Type": contentType,
    },
  });
}
