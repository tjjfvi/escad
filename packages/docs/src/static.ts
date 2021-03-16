
import { stylusGlobals } from "@escad/bundler"
import webpack from "webpack"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"
import { promisify } from "util"
import fs from "fs-extra"
import { resolve, dirname } from "path"

const staticDir = resolve(__dirname, "../static/")

export async function outputStatic(outDir: string){
  await Promise.all([
    bundleTs(outDir),
    copyStaticFiles(outDir),
  ])
}

async function copyStaticFiles(outDir: string){
  const staticFiles = [
    "index.html",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon.ico",
  ]
  await Promise.all(staticFiles.map(async file => {
    await fs.mkdirp(dirname(file))
    await fs.copyFile(resolve(staticDir, file), resolve(outDir, file))
  }))
}

async function bundleTs(outDir: string){
  const compiler = webpack({
    entry: [require.resolve("./client")],
    output: {
      path: outDir,
      filename: "bundle.js",
      sourceMapFilename: "bundle.js.map",
    },
    optimization: {
      minimize: false,
    },
    module: {
      rules: [
        {
          test: /^.*\.styl$/,
          use: [
            { loader: require.resolve("style-loader") },
            { loader: require.resolve("css-loader") },
            {
              loader: require.resolve("stylus-loader"),
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
    ],
  })
  await promisify(compiler.run.bind(compiler))()
}
