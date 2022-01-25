import { ts } from "../deps/tsc.ts";
import { stylus } from "../deps/stylus.ts";
import { TranspilerServerMessenger } from "../protocol/mod.ts";
import { Connection, createMessenger } from "../messages/mod.ts";

export interface TranspileContext {
  memo: Map<string, Promise<unknown>>;
  cache: {
    has: (url: string) => Promise<boolean>;
    set: (url: string, result: string) => Promise<void>;
  };
  transformUrl: (url: string) => string;
}

export async function transpile(
  url: string,
  ctx: TranspileContext,
  force = false,
) {
  let running = ctx.memo.get(url);
  if (running && !force) {
    await running;
    return;
  }
  console.log("transpiling", url);
  let prom = (async () => {
    if (!force && await ctx.cache.has(url)) {
      return;
    }
    let [result, deps] = await _transpile(url, ctx);
    return [ctx.cache.set(escapeUrl(url), result), deps] as const;
  })();
  ctx.memo.set(url, prom);
  let [cacheProm, deps] = await prom ?? [];
  if (deps) {
    await Promise.all(deps.map((dep) => transpile(dep, ctx)));
  }
  await cacheProm;
}

async function _transpile(url: string, ctx: TranspileContext) {
  let response = await fetch(url);
  if (!response.ok) {
    let error = new Error(`Error fetching ${url} for transpilation`);
    // @ts-ignore
    error.response = response;
    throw error;
  }
  let content = await response.text();
  const transpileFn = url.endsWith(".css")
    ? _transpileCss
    : url.endsWith(".styl")
    ? _transpileStyl
    : _transpileTs;
  return await transpileFn(url, content, ctx);
}

let stylusStdlib = fetch(
  "https://unpkg.com/stylus@0.56.0/lib/functions/index.styl",
).then((r) => r.text());

let stylusGlobals = `
$black = #151820
$darkgrey = #252830
$grey = #454850
$lightgrey = #656870
$white = #bdc3c7
$red = #c0392b
$orange = #d35400
$yellow = #f1c40f
$green = #2ecc71
$blue = #0984e3
$purple = #8e44ad

prefix(prop)
  -webkit-{prop} slice(arguments, 1)
  -moz-{prop} slice(arguments, 1)
  -ms-{prop} slice(arguments, 1)
  {prop} slice(arguments, 1)
`;

async function _transpileStyl(
  url: string,
  content: string,
  ctx: TranspileContext,
) {
  content = [
    await stylusStdlib,
    stylusGlobals,
    content,
  ].join("\n\n\n\n\n");
  let renderer = stylus.default(content);
  renderer.options.imports = [];
  let css = renderer.render();
  return _transpileCss(url, css, ctx);
}

async function _transpileCss(
  url: string,
  content: string,
  ctx: TranspileContext,
) {
  let jsUrl = url + ".js";
  let jsContent = `
let el = document.createElement("link");
el.type = "text/css";
el.rel = "stylesheet";
el.href = ${JSON.stringify(ctx.transformUrl(escapeUrl(url)))};
document.head.appendChild(el);
await new Promise(r => el.onload = r)
  `;
  ctx.memo.set(jsUrl, ctx.cache.set(escapeUrl(jsUrl), jsContent));
  return [content, [jsUrl]] as const;
}

async function _transpileTs(
  url: string,
  content: string,
  ctx: TranspileContext,
) {
  let deps: string[] = [];
  let result = ts.transpileModule(content, {
    fileName: url,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      allowJs: true,
      jsx: url.endsWith(".tsx") || url.endsWith(".jsx")
        ? ts.JsxEmit.React
        : ts.JsxEmit.None,
    },
    transformers: {
      after: [
        (context) =>
          (sourceFile) => {
            function visitor(node: ts.Node): ts.Node {
              if (
                node.kind === ts.SyntaxKind.StringLiteral &&
                [
                  ts.SyntaxKind.ImportDeclaration,
                  ts.SyntaxKind.ImportSpecifier,
                  ts.SyntaxKind.ExportDeclaration,
                ].includes(node.parent?.kind)
              ) {
                let str = JSON.parse(
                  `"${node.getText(sourceFile).slice(1, -1)}"`,
                );
                let resolved = (new URL(str, url)).toString();
                deps.push(resolved);
                return ts.factory.createStringLiteral(
                  ctx.transformUrl(transformUrl(escapeUrl(resolved))),
                );
              }
              return ts.visitEachChild(node, visitor, context);
            }

            return ts.visitNode(sourceFile, visitor);
          },
      ],
    },
  });
  return [result.outputText, deps] as const;
}

function escapeUrl(url: string) {
  return url.replace(/[?#]/g, "_").replace(/\.\./g, "__");
}

function transformUrl(url: string) {
  if (url.endsWith(".css") || url.endsWith(".styl")) {
    return url + ".js";
  }
  return url;
}

export function createTranspilerServerMessenger(
  ctx: TranspileContext,
  connection: Connection<unknown>,
): TranspilerServerMessenger {
  let runningCount = 0;
  const messenger: TranspilerServerMessenger = createMessenger({
    impl: {
      transpile: async (url, force) => {
        runningCount++;
        await transpile(url, ctx, force);
        runningCount--;
        if (runningCount === 0) {
          messenger.emit("transpileFinish");
        }
      },
    },
    connection,
  });
  return messenger;
}
