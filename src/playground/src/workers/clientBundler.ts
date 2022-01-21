
import "../main/initialize"
import { createBundlerServerMessenger, stylusGlobals } from "@escad/bundler"
import { workerConnection, brandConnection } from "@escad/messages"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import { webpack } from "webpack"
import { createResourceFileAsync, getResourceFilePath } from "../utils/resourceFiles"
import fakeImportAllEscadSource from "!!raw-loader!../utils/fakeImportAllEscad.js"
import { mapModuleIds } from "../utils/mapModuleIds"
import path from "path"

createBundlerServerMessenger(
  brandConnection(workerConnection(self as any), "bundler"),
  async (options, entryPaths) =>
    webpack({
      entry: {
        bundle: {
          import: await createResourceFileAsync(
            entryPaths.map(x => `import "${path.resolve("../project", x)}";`).join("\n"),
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
        mapModuleIds(id => id.replace(/^\.\/project\/node_modules\//, "./node_modules/")),
      ],
      resolveLoader: {
        modules: ["/bundled/node_modules"],
      },
    }),
)
