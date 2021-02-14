
import "../main/initialize";
import { createBundlerServerMessenger, stylusGlobals } from "@escad/bundler";
import { workerConnection, brandConnection } from "@escad/messages";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import { webpack } from "webpack";
import { getResourceFilePath } from "../utils/resourceFiles";
import fsMockSource from "!!raw-loader!@escad/bundler/dist/fs-mock.js"

createBundlerServerMessenger(
  brandConnection(workerConnection(self as any), "bundler"),
  (options, entryPaths) =>
    // debugger;
    webpack({
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
          "fs": getResourceFilePath(fsMockSource),
        },
        modules: ["/project/node_modules"],
      },
      module: {
        rules: [
          {
            test: /^.*\.styl$/,
            use: [
              { loader: "style-loader" },
              { loader: "css-loader" },
              {
                loader: "stylus-loader",
                options: {
                  stylusOptions: {
                    define: stylusGlobals,
                  },
                },
              },
            ]
          }
        ],
      },
      devtool: "source-map",
      mode: "development",
      plugins: [
        new NodePolyfillPlugin(),
      ],
      resolveLoader: {
        modules: ["/bundled/node_modules"],
      }
    })
);
