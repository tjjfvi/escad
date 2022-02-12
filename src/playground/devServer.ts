import { Application, Router, send } from "../deps/oak.ts";
import * as path from "../deps/path.ts";

import { createTranspiler } from "../server/transpiler.ts";
import { contentType } from "../deps/media_types.ts";
import { transformUrl } from "../server/transformUrl.ts";

const prod = Deno.env.get("PROD");

const dirname = path.dirname(path.fromFileUrl(import.meta.url));
const escadDir = path.dirname(dirname);

const port = +(Deno.env.get("PORT") ?? "8080");
const escadHost = prod ? "https://escad.dev" : `http://localhost:${port}`;

const staticDir = path.join(dirname, "static");

const getTranspiledLocation = (url: string) =>
  path.join(staticDir, getTranspiledPath(url));
const getTranspiledPath = (url: string) => {
  if (url.startsWith("file://" + escadDir + "/")) {
    return `/transpiled/${escadHost}/` +
      url.slice(("file://" + escadDir + "/").length);
  }
  return `/transpiled/${url}`;
};
const transpiler = createTranspiler({
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
});

let mainFile = `file://${dirname}/main.tsx`;
let workerFile = `file://${dirname}/transpilerWorker.ts`;
let swFile = `file://${dirname}/sw.ts`;
let clientFile = `file://${dirname}/client.tsx`;
let rootFiles = [
  mainFile,
  workerFile,
  swFile,
  clientFile,
  `file://${escadDir}/builtins/mod.ts`,
  `file://${escadDir}/builtins/register.ts`,
  `file://${escadDir}/builtins/client-plugin/mod.ts`,
  `file://${escadDir}/server/renderer.ts`,
];

await transpiler.transpileAll(rootFiles);

const app = new Application();

const router = new Router();

router.get("/version", async (ctx) => {
  transpiler.memo.clear();
  await transpiler.transpileAll(rootFiles);
  ctx.response.body = Date.now().toString();
});

router.get("/", async (ctx) => {
  await send(ctx, "index.html", {
    root: staticDir,
  });
});

router.get("/main.js", async (ctx) => {
  await send(ctx, getTranspiledPath(transformUrl(mainFile)), {
    root: staticDir,
  });
});

router.get("/sw.js", async (ctx) => {
  await send(ctx, getTranspiledPath(transformUrl(swFile)), { root: staticDir });
});

app.use(router.routes());
app.use(router.allowedMethods());

let escadPackages = [...Deno.readDirSync(path.dirname(dirname))].map((x) =>
  x.name
);

app.use(async (ctx) => {
  if (escadPackages.includes(ctx.request.url.pathname.split("/")[1])) {
    await send(ctx, ctx.request.url.pathname, {
      root: path.dirname(dirname),
    });
  } else {
    await send(ctx, ctx.request.url.pathname, {
      root: staticDir,
      contentTypes: new Proxy({}, {
        get: (_target, key) => {
          if (key === ".styl") return contentType(".css");
          return contentType(key as string) ?? contentType(".js");
        },
      }),
    });
  }
});

if (!prod) {
  console.log("listening");
  await app.listen({ port });
}
