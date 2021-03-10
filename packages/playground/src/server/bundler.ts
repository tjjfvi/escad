
import webpack, { NormalModule } from "webpack"
// @ts-ignore
import CachedConstDependency = require("webpack/lib/dependencies/CachedConstDependency");
import MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
import NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
import { stylusGlobals } from "@escad/bundler";
import path from "path";
import { mapModuleIds } from "../utils/mapModuleIds";

export const staticDir = __dirname + "/../../static/";
const bundledDir = staticDir + "bundled/";

const prefix = "/bundled/";

export const compiler = webpack({
  entry: {
    bundle: {
      import: require.resolve("../main/index"),
      dependOn: "escad",
    },
    escad: require.resolve("../utils/fakeImportAllEscad"),
  },
  output: {
    path: bundledDir,
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    chunkLoadingGlobal: "webpackChunk",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    alias: {
      child_process: require.resolve("../stubs/child_process"),
      fs: "browserfs/dist/shims/fs.js",
      buffer: "browserfs/dist/shims/buffer.js",
      path: "browserfs/dist/shims/path.js",
      processGlobal: "browserfs/dist/shims/process.js",
      bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
      bfsGlobal: require.resolve("browserfs"),
      process$: "process/browser",
    }
  },
  devtool: "source-map",
  mode: "development",
  module: {
    // REQUIRED to avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
    // See: https://github.com/jvilk/BrowserFS/issues/201
    noParse: /browserfs\.js/,
    rules: [
      {
        test: /^.*\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
        ]
      },
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
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"]
      },
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      BrowserFS: 'bfsGlobal',
      // process: 'process',
      // Buffer: 'bufferGlobal'
    }),
    new MonacoWebpackPlugin(),
    // Modified from <https://github.com/webpack/webpack/blob/master/lib/NodeStuffPlugin.js>
    function(compiler){
      compiler.hooks.compilation.tap(
        "FileDirName",
        (comilation, { normalModuleFactory }) => {
          const handler = (parser: any) => {
            const setModuleConstant = (expressionName: string, fn: (module: NormalModule) => string) => {
              parser.hooks.expression
                .for(expressionName)
                .tap("FileDirName", (expr: any) => {
                  const dep = new CachedConstDependency(
                    JSON.stringify(fn(parser.state.module)),
                    expr.range,
                    expressionName
                  );
                  dep.loc = expr.loc;
                  parser.state.module.addPresentationalDependency(dep);
                  return true;
                });
            };

            setModuleConstant("__filename", module =>
              path.resolve(prefix, path.relative(compiler.context, module.resource))
            )
            setModuleConstant("__dirname", module =>
              path.resolve(prefix, path.relative(compiler.context, path.dirname(module.resource)))
            )
          }
          normalModuleFactory.hooks.parser
            .for("javascript/auto")
            .tap("NodeStuffPlugin", handler);
          normalModuleFactory.hooks.parser
            .for("javascript/dynamic")
            .tap("NodeStuffPlugin", handler);
        }
      )
    },
    mapModuleIds(id => id.replace(/\\/g, "/").replace(/^\.\/packages\//g, "./node_modules/@escad/")),
  ],
})
