
/* eslint-disable no-console */

import path from "path";
import webpack, { Compiler } from "webpack"
import { EventEmitter } from "tsee";
import readPkgUp from "read-pkg-up";
import { PluginRegistration } from "@escad/register-client-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

export interface BundlerOptions {
  outDir: string,
  coreClientPath: string,
  watch?: boolean,
  log?: boolean,
}

export class Bundler extends EventEmitter<{
  tsBundle: () => void,
}> {

  private watcher?: ReturnType<Compiler["watch"]>;
  private compiler?: Compiler;

  clientPlugins: PluginRegistration[] = []

  constructor(private options: BundlerOptions){
    super();
    this.forceRefresh();
  }

  updateClientPlugins(clientPlugins: PluginRegistration[]){
    const oldClientPlugins = this.clientPlugins;
    this.clientPlugins = clientPlugins;
    if(JSON.stringify(this.clientPlugins) !== JSON.stringify(oldClientPlugins))
      this.forceRefresh();
  }

  forceRefresh(){
    this.createCompiler();
  }

  private getTsPaths(){
    return [this.options.coreClientPath, ...this.clientPlugins.map(reg => reg.path)];
  }

  private getStylusPaths(){
    return this.getTsPaths().map(file => {
      let result = readPkgUp.sync({ cwd: file });
      if(!result)
        throw new Error("Could not find package.json from file " + file);
      if("stylus" in result.packageJson && typeof result.packageJson.stylus === "string")
        return path.resolve(path.dirname(result.path), result.packageJson.stylus);
      return null;
    }).filter((x): x is string => x !== null);
  }

  private createCompiler(){
    this.watcher?.close(() => {});
    this.watcher = undefined;

    this.compiler = webpack({
      entry: this.getTsPaths(),
      output: {
        path: this.options.outDir,
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
              { loader: "style-loader" },
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                },
              },
              {
                loader: "stylus-loader",
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

    const handler = (err: Error | undefined) => {
      if(err)
        return console.error(err);
      if(this.options.log)
        console.log("Bundled TS");
      this.emit("tsBundle");
    }

    if(this.options.watch ?? false)
      this.watcher = this.compiler.watch({}, handler);
    else
      this.compiler.run(handler);

    return this.compiler;
  }

}
