
import webpack, { Compiler, Stats } from "webpack"
import { Connection, createEmittableAsyncIterable, createMessenger } from "@escad/messages";
import { BundleOptions, BundlerServerMessenger } from "@escad/protocol";
import { hash, Hash } from "@escad/core";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import { writeFile } from "fs-extra";
import path from "path";

export const createBundlerServerMessenger = (connection: Connection<unknown>): BundlerServerMessenger => {
  const [emitBundle, onBundle] = createEmittableAsyncIterable<Hash>();

  let watcher: ReturnType<Compiler["watch"]> | undefined;

  let lastOptionsHash: Hash | undefined;

  return createMessenger({
    bundle,
    onBundle,
  }, connection);

  async function bundle(options: BundleOptions){
    const optionsHash = hash(options);
    if(optionsHash === lastOptionsHash)
      return;
    lastOptionsHash = optionsHash;

    const entryPaths = [options.coreClientPath, ...options.clientPlugins.map(reg => reg.path)];

    watcher?.close(() => {});
    watcher = undefined;

    const compiler = webpack({
      entry: entryPaths,
      output: {
        path: options.outDir,
        filename: "bundle.js",
        sourceMapFilename: "bundle.js.map",
      },
      optimization: {
        minimize: false,
      },
      resolve: {
        alias: {
          "fs": require.resolve("./fs-mock"),
        }
      },
      module: {
        rules: [
          {
            test: /^.*\.styl$/,
            use: [
              { loader: require.resolve("style-loader") },
              {
                loader: require.resolve("css-loader"),
                options: {
                  sourceMap: true
                },
              },
              {
                loader: require.resolve("stylus-loader"),
                options: {
                  sourceMap: true,
                  webpackImporter: false,
                },
              },
            ]
          }
        ]
      },
      devtool: "source-map",
      mode: "development",
      plugins: [
        new NodePolyfillPlugin(),
      ]
    })

    const handler = (err: Error | undefined, result: Stats | undefined) => {
      if(err) console.error(err);
      const bundleHash = hash(result?.compilation.fullHash ?? Math.random());
      writeFile(path.join(options.outDir, "bundle.hash"), bundleHash);
      emitBundle(bundleHash);
    }

    if(options.watch ?? false)
      watcher = compiler.watch({}, handler);
    else
      compiler.run(handler);
  }
}
