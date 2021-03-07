
import "worker-loader?filename=dynamicWorkerSetup.worker.js!./dynamicWorkerSetup.js";
import "../main/initialize";
import webpack, { ProvidePlugin } from "webpack";
import fs from "fs";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import rendererSource from "!!raw-loader!./renderer.js";
import { getResourceFilePath } from "../utils/resourceFiles";
import { brandConnection, createMessenger, workerConnection } from "@escad/messages";
import { promisify } from "util";
import { ModuleKind, ModuleResolutionKind, ScriptTarget, transpileModule } from "typescript"
import { fsPromise } from "../main/initialize";

export type RendererBundlerMessengerShape = {
  bundle: () => Promise<void>,
}

const compiler = webpack({
  entry: [getResourceFilePath(rendererSource)],
  output: {
    path: "/out/",
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
    hashFunction: "md5",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    alias: {
      fs: getResourceFilePath("module.exports=self.fs"),
    },
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
    new ProvidePlugin({
      process: getResourceFilePath("module.exports=self.process")
    })
  ]
})

// @ts-ignore
compiler.inputFileSystem.join = fs.join;

const run = promisify(compiler.run.bind(compiler))
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

createMessenger<RendererBundlerMessengerShape, {/**/}>({
  bundle: async () => {
    await fsPromise;
    const orig = await readFile("/project/index.ts", "utf8");
    const transpiled = transpileModule(orig, {
      compilerOptions: {
        strict: true,
        esModuleInterop: true,
        target: ScriptTarget.ES2019,
        downlevelIteration: true,
        moduleResolution: ModuleResolutionKind.NodeJs,
        module: ModuleKind.CommonJS,
      }
    }).outputText
    await writeFile("/project/index.js", transpiled);
    await run();
  }
}, brandConnection(workerConnection(self as any), "rendererBundler"));
