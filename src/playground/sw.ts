/// <reference lib="webworker"/>

import { getContentType } from "../transpiler/getContentType.ts";

export {};

const sw = self as never as ServiceWorkerGlobalScope;

sw.addEventListener("install", (event) => {
  console.log("service worker install", event);
});

sw.addEventListener("activate", (event) => {
  console.log("service worker activate", event);
});

let vfsCache = "escad-vfs-v6";

sw.addEventListener("fetch", function (event) {
  const req = event.request;
  const path = new URL(req.url).pathname;
  if (path === "/sw.js") return;
  if (path === "/vfs/clear") {
    event.respondWith(
      new Response("cleared vfs " + Date.now(), { status: 200 }),
    );
    caches.delete(vfsCache);
    return;
  }
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
