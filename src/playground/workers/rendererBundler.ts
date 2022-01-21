
import "../main/initialize"
import webpack from "webpack.ts"
import fs from "fs.ts"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin.ts"
import rendererSource from "!!raw-loader!./renderer.js.ts"
import { getResourceFilePath } from "../utils/resourceFiles.ts"
import { brandConnection, createMessenger, workerConnection } from "../messages/mod.ts"
import { promisify } from "util.ts"
import { ModuleKind, ModuleResolutionKind, ScriptTarget, transpileModule } from "typescript.ts"
import { fsPromise } from "../main/initialize.ts"
import fakeImportAllEscadSource from "!!raw-loader!../utils/fakeImportAllEscad.js.ts"
import { mapModuleIds } from "../utils/mapModuleIds.ts"

export type RendererBundlerMessengerShape = {
  bundle: () => Promise<void>,
}

const compiler = webpack({
  entry: {
    bundle: {
      import: getResourceFilePath(rendererSource),
      dependOn: "escad",
    },
    escad: getResourceFilePath(fakeImportAllEscadSource),
  },
  output: {
    path: "/out/",
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    hashFunction: "md5",
    chunkLoadingGlobal: "webpackChunk",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    modules: ["/project/node_modules"],
  },
  node: {
    global: true,
    __filename: true,
    __dirname: true,
  },
  devtool: "source-map",
  mode: "development",
  plugins: [
    new NodePolyfillPlugin(),
    mapModuleIds(id => id.replace(/^\.\/project\/node_modules\//, "./node_modules/")),
  ],
})

// @ts-ignore
compiler.inputFileSystem.join = fs.join

const run = promisify(compiler.run.bind(compiler))
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

createMessenger<RendererBundlerMessengerShape, {}, {}>({
  impl: {
    bundle: async () => {
      await fsPromise
      const orig = await readFile("/project/index.ts", "utf8")
      const transpiled = transpileModule(orig, {
        compilerOptions: {
          strict: true,
          esModuleInterop: true,
          target: ScriptTarget.ES2019,
          downlevelIteration: true,
          moduleResolution: ModuleResolutionKind.NodeJs,
          module: ModuleKind.CommonJS,
        },
      }).outputText
      await writeFile("/project/index.js", transpiled)
      await run()
    },
  },
  connection: brandConnection(workerConnection(self as any), "rendererBundler"),
})
