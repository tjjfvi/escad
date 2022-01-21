import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import * as path from "https://deno.land/std@0.122.0/path/mod.ts";

import { transpile, TranspileContext } from "../transpiler/mod.ts";
import { contentType } from "https://deno.land/x/media_types/mod.ts";

const dirname = path.dirname(path.fromFileUrl(import.meta.url));

const staticDir = path.join(dirname, "static");

const replaceTsExtension = (url: string) =>
  url.replace(/\.tsx?$|(?<=\/[^/\.]*)$/, ".js");
const getTranspiledLocation = (url: string) =>
  replaceTsExtension(path.join(staticDir, url));
const getTranspiledPath = (url: string) => `/${replaceTsExtension(url)}`;
const transpileContext: TranspileContext = {
  memo: new Map(),
  cache: {
    has: async (url) => {
      if (url.startsWith("file://")) return false;
      try {
        await Deno.lstat(getTranspiledLocation(url));
        return true;
      } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
          return false;
        } else {
          throw e;
        }
      }
    },
    set: async (url, result) => {
      let loc = getTranspiledLocation(url);
      await Deno.mkdir(path.dirname(loc), { recursive: true });
      await Deno.writeTextFile(loc, result);
    },
  },
  transformUrl: getTranspiledPath,
};

let mainFile = `file://${dirname}/mod.tsx`;
let workerFile = `file://${dirname}/transpilerWorker.ts`;
let swFile = `file://${dirname}/sw.ts`;
let clientFile = `file://${dirname}/client.tsx`;
let rootFiles = [mainFile, workerFile, swFile, clientFile];

await Promise.all(rootFiles.map((file) => transpile(file, transpileContext)));

const app = new Application();

const router = new Router();

router.get("/", async (ctx) => {
  transpileContext.memo.clear();
  await Promise.all(rootFiles.map((file) => transpile(file, transpileContext)));
  await send(ctx, "index.html", {
    root: staticDir,
  });
});

router.get("/main.js", async (ctx) => {
  await send(ctx, getTranspiledPath(mainFile), { root: staticDir });
});

router.get("/sw.js", async (ctx) => {
  await send(ctx, getTranspiledPath(swFile), { root: staticDir });
});

app.use(router.routes());
app.use(router.allowedMethods());

let escadPackages = [...Deno.readDirSync(path.dirname(dirname))].map((x) =>
  x.name
);

app.use(async (ctx, next) => {
  if (escadPackages.includes(ctx.request.url.pathname.split("/")[1])) {
    await send(ctx, ctx.request.url.pathname, {
      root: path.dirname(dirname),
    });
  } else {
    await send(ctx, ctx.request.url.pathname, {
      root: staticDir,
      contentTypes: new Proxy({}, {
        get: (target, key) => {
          if (key === ".styl") return contentType(".css");
          return contentType(key as string) ?? contentType(".js");
        },
      }),
    });
  }
});

const port = +(Deno.env.get("PORT") ?? "8080");

console.log("listening");
await app.listen({ port });
