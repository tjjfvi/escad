import { createServer as _createServer } from "../server/mod.ts";
import * as path from "../deps/path.ts";
import {
  logConnection,
  serializeConnection,
  workerConnection,
} from "../messages/mod.ts";
import { Application, send } from "../deps/oak.ts";
import { contentType } from "../deps/media_types.ts";

export interface ServerOptions {
  artifactsDir: string;
  port: number;
  ip: string;
  loadFile: string;
  loadDir: string;
  dev: boolean;
}

export const createServer = async ({
  artifactsDir,
  port,
  ip = "::",
  loadFile,
  loadDir,
  dev,
}: ServerOptions) => {
  const bundleDir = path.join(artifactsDir, "static/");

  Deno.env.set("ARTIFACTS_DIR", artifactsDir);
  Deno.env.set("LOAD_FILE", loadFile);
  Deno.env.set("DEV_MODE", dev.toString());
  Deno.env.set("BUNDLE_DIR", bundleDir);

  await Deno.mkdir(bundleDir, { recursive: true });

  const server = await _createServer({
    createRendererConnection: () =>
      serializeConnection(workerConnection(worker("./renderer.ts"))),
    transpilerConnection: workerConnection(worker("./transpiler.ts")),
    coreClientUrl: new URL("./client.tsx", import.meta.url).toString(),
    writeClientRoot: (content) =>
      Deno.writeTextFile(path.join(bundleDir, "main.js"), content),
    getTranspiledUrl: (url) => "/" + url,
  });

  const app = new Application();

  const staticFiles = [
    "index.html",
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
  ];

  for (let file of staticFiles) {
    let response = await fetch(new URL("./static/" + file, import.meta.url));
    let content = await response.arrayBuffer();
    app.use((ctx, next) => {
      if (
        !(ctx.request.url.pathname === "/" + file ||
          file === "index.html" && ctx.request.url.pathname === "/")
      ) {
        return next();
      }
      ctx.response.body = content;
      ctx.response.headers.set(
        "Content-Type",
        response.headers.get("Content-Type")!,
      );
    });
  }

  app.use(async (ctx, next) => {
    try {
      console.log(ctx.request.url.pathname);
      await send(ctx, ctx.request.url.pathname, {
        root: bundleDir,
        contentTypes: new Proxy({}, {
          get: (target, key) => {
            if (key === ".styl") return contentType(".css");
            return contentType(key as string) ?? contentType(".js");
          },
        }),
      });
    } catch {
      await next();
    }
  });

  app.use(async (ctx, next) => {
    if (!ctx.request.url.pathname.startsWith("/artifacts")) return next();
    try {
      await send(ctx, ctx.request.url.pathname.slice("/artifacts".length), {
        root: artifactsDir,
      });
    } catch {
      await next();
    }
  });

  // TODO: watch

  app.use(async (ctx, next) => {
    if (ctx.request.url.pathname !== "/ws/") return next();
    const ws = ctx.upgrade();
    await new Promise((r) => ws.onopen = r);
    const client = server.addClient(
      logConnection(serializeConnection({
        send: (msg) => ws.send(msg),
        onMsg: (cb) => {
          let wrapped = (e: MessageEvent) => cb(e.data);
          ws.addEventListener("message", wrapped);
          return () => ws.removeEventListener("message", wrapped);
        },
      })),
    );
    ws.addEventListener("close", () => client.destroy());
    ws.addEventListener("error", () => client.destroy());
  });

  app.listen({ port, hostname: ip });

  let isIpV4 = /^(\d{1,3}\.){3}\d{1,3}}$/.test(ip);
  console.log(`Listening on http://${isIpV4 ? ip : `[${ip}]`}:${port}`);
};

function worker(relativePath: string) {
  return new Worker(
    new URL(relativePath, import.meta.url).toString(),
    {
      type: "module",
      deno: {
        namespace: true,
      },
    },
  );
}
