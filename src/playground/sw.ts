/// <reference lib="webworker"/>

import { getContentType } from "../transpiler/getContentType.ts";

export {};

const sw = self as never as ServiceWorkerGlobalScope;

sw.addEventListener("install", (event) => {
  console.log(event);
});

console.log("service worker restart");

let vfsCache = "escad-vfs-v6";

caches.delete(vfsCache);

sw.addEventListener("fetch", function (event) {
  const req = event.request;
  const path = new URL(req.url).pathname;
  if (path === "/sw.js") return;
  if (path.startsWith("/vfs/")) {
    console.log(req.method, path, "foo");
    event.respondWith((async () => {
      let cache = await caches.open(vfsCache);
      if (req.method === "PUT") {
        let content = await event.request.blob();
        let extension = req.url.match(/\.\w+$/)?.[0];
        let contentType = extension
          ? getContentType(extension)
          : getContentType(".js");
        await cache.put(
          new Request(req.url),
          new Response(content, {
            headers: { "Content-Type": contentType },
          }),
        );
        return new Response(null, { status: 200 });
      } else {
        let cacheResult = await cache.match(event.request);
        return cacheResult ?? new Response(null, { status: 404 });
      }
    })());
  }
});
