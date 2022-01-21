import "../main/initialize";
import { createBundlerServerMessenger, stylusGlobals } from "../bundler/mod.ts";
import { brandConnection, workerConnection } from "../messages/mod.ts";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin.ts";
import { webpack } from "webpack.ts";
import {
  createResourceFileAsync,
  getResourceFilePath,
} from "../utils/resourceFiles.ts";
import fakeImportAllEscadSource from "!!raw-loader!../utils/fakeImportAllEscad.js.ts";
import { mapModuleIds } from "../utils/mapModuleIds.ts";
import path from "path.ts";

createBundlerServerMessenger(
  brandConnection(workerConnection(self as any), "bundler"),
  async (options, entryPaths) =>
    webpack({
      entry: {
        bundle: {
          import: await createResourceFileAsync(
            entryPaths.map((x) => `import "${path.resolve("../project", x)}";`)
              .join("\n"),
          ),
          dependOn: "escad",
        },
        escad: getResourceFilePath(fakeImportAllEscadSource),
      },
      output: {
        path: options.outDir,
        filename: "[name].js",
        sourceMapFilename: "[name].js.map",
        chunkLoadingGlobal: "webpackChunk",
      },
      optimization: {
        minimize: false,
      },
      resolve: {
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
            ],
          },
        ],
      },
      devtool: "source-map",
      mode: "development",
      plugins: [
        new NodePolyfillPlugin(),
        mapModuleIds((id) =>
          id.replace(/^\.\/project\/node_modules\//, "./node_modules/")
        ),
      ],
      resolveLoader: {
        modules: ["/bundled/node_modules"],
      },
    }),
);
