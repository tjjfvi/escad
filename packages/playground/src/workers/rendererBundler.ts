
import "worker-loader?filename=dynamicWorkerSetup.worker.js!./dynamicWorkerSetup.js";
import "../main/initialize";
import webpack, { ProvidePlugin } from "webpack";
import fs from "fs";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import rendererSource from "!!raw-loader!./renderer.js";
import { getResourceFilePath } from "../utils/resourceFiles";
import { brandConnection, createMessenger, workerConnection } from "@escad/messages";
import { promisify } from "util";

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

createMessenger<RendererBundlerMessengerShape, {/**/}>({
  bundle: async () => void await run()
}, brandConnection(workerConnection(self as any), "rendererBundler"));
