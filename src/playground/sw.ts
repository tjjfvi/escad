/// <reference lib="webworker"/>

const sw = self as never as ServiceWorkerGlobalScope;

let version: string | null = null;

sw.addEventListener("install", (event) => {
  console.log("service worker install", event);
  sw.skipWaiting();
});

sw.addEventListener("message", (event) => {
  if (event.data === "ping") {
    event.source?.postMessage("pong");
  }
});

sw.addEventListener("activate", (event) => {
  console.log("service worker activate", event);
  event.waitUntil(Promise.all([
    sw.clients.claim().then(async () => {
      for (let client of await sw.clients.matchAll({ type: "window" })) {
        client.navigate(client.url);
      }
    }),
    updateVersion(),
  ]));
});

const generalCache = "general";
const transpiledCache = "transpiled";
const artifactsCache = "artifacts";

const genericCaches = [generalCache, transpiledCache, artifactsCache];

sw.addEventListener("fetch", function (event) {
  const { request } = event;
  const url = new URL(request.url);
  const path = url.pathname;
  const isLocal = url.hostname === self.location.hostname;
  if (isLocal) {
    if (path === "/") {
      return event.respondWith(handleRootRequest(event));
    }
    if (path === "/sw.js") {
      return;
    }
    if (path.startsWith("/sw/")) {
      return event.respondWith(handleApiRequest(event));
    }
  }
  return event.respondWith(handleCacheRequest(event));

  async function handleCacheRequest(event: FetchEvent): Promise<Response> {
    let cached = await caches.match(event.request);
    if (cached) return cached;
    if (
      isLocal &&
      (path.startsWith("/artifacts/") || /^\/playground-[\w-]+\//.test(path))
    ) {
      return new Response(null, { status: 404 });
    }
    const response = await fetch(event.request);
    if (response.ok) {
      console.log("put cache", event.request.url, response.status);
      const cachedResponse = response.clone();
      caches.open(generalCache).then((cache) =>
        cache.put(event.request, cachedResponse)
      );
    }
    return response;
  }

  async function handleApiRequest(event: FetchEvent): Promise<Response> {
    if (path === "/sw/clientId") {
      return new Response("playground-" + event.clientId, { status: 200 });
    }
    if (path === "/sw/reset") {
      await resetCaches();
      return new Response("Cleared all caches at " + new Date(), {
        status: 200,
      });
    }
    let match = path.match(/^\/sw(\/([\w-]+)\/.+)/);
    if (!match || request.method !== "PUT") {
      console.log("bleh");
      return new Response(null, { status: 400 });
    }
    const [, cachePath, cacheName] = match;
    if (
      cacheName !== "playground-" + event.clientId &&
      !genericCaches.includes(cacheName)
    ) {
      console.log("bleh2", cacheName, event.clientId);
      return new Response(null, { status: 400 });
    }
    const cacheRequest = new Request(cachePath);
    const body = await request.blob();
    const cacheResponse = new Response(body, {
      headers: request.headers,
      status: 200,
    });
    await (await caches.open(cacheName)).put(cacheRequest, cacheResponse);
    console.log("Put", cachePath, await caches.match(cacheRequest));
    return new Response(null, { status: 200 });
  }

  async function handleRootRequest(event: FetchEvent) {
    deleteOldClientCaches();
    await updateVersion();
    return handleCacheRequest(event);
  }
});

async function deleteOldClientCaches() {
  for (const cacheName of await caches.keys()) {
    if (cacheName.startsWith("playground-")) {
      sw.clients.get(cacheName.slice("playground-".length)).then((client) => {
        if (!client) {
          caches.delete(cacheName);
        }
      });
    }
  }
}

async function resetCaches() {
  await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
}

async function updateVersion() {
  let response;
  try {
    response = await fetch("/version");
  } catch {
    return;
  }
  if (!response.ok) return;
  let newVersion = await response.text();
  if (newVersion === version) {
    return;
  }
  version = newVersion;
  await resetCaches();
}
