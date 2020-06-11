
/* eslint-disable no-console */

import fs from "fs-extra";
import stylus from "stylus";
import watchDir from "node-watch";
import path from "path";
import webpack, { Compiler } from "webpack"
import { ClientPluginRegistration } from "@escad/server-renderer-messages"
import { EventEmitter } from "tsee";
import readPkgUp from "read-pkg-up";

export interface BundlerOptions {
  outDir: string,
  coreClientPath: string,
  watch?: boolean,
  log?: boolean,
}

export class Bundler extends EventEmitter<{
  tsBundle: () => void,
  stylusBundle: (css: string) => void,
}> {

  private watcher?: Compiler.Watching;
  private compiler?: Compiler;
  private closeStylusWatch = () => {};

  clientPlugins: ClientPluginRegistration[] = []

  constructor(private options: BundlerOptions){
    super();
    this.forceRefresh();
  }

  updateClientPlugins(clientPlugins: ClientPluginRegistration[]){
    const oldClientPlugins = this.clientPlugins;
    this.clientPlugins = clientPlugins;
    if(JSON.stringify(this.clientPlugins) !== JSON.stringify(oldClientPlugins))
      this.forceRefresh();
  }

  forceRefresh(){
    this.createCompiler();
    this.bundleStylus();
    if(this.options.watch)
      this.createStylusWatchers();
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
      }
    })

    const handler = (err: Error | null) => {
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

  private createStylusWatchers(){
    this.closeStylusWatch();

    const watchers = this.getStylusPaths().map(p => watchDir(p, {
      persistent: false,
      recursive: true,
    }, () => this.bundleStylus()));

    this.closeStylusWatch = () => watchers.map(w => w.close());
  }

  private async bundleStylus(){
    if(this.options.log)
      console.log("Bundling stylus...");
    const css = await new Promise<string | undefined>(r => stylus.render(
      this.getStylusPaths().map(dir =>
        `@import '${path.join(dir, "*")}'`
      ).join("\n"),
      {
        filename: "_.styl",
        // @ts-ignore
        sourcemap: {
          comment: false,
          inline: true,
        },
      },
      (error: Error, css: string) => {
        if(error)
          return r(void console.error(error));
        return r(css);
      }
    ));
    if(!css)
      return;
    await fs.writeFile(path.join(this.options.outDir, "bundle.css"), css);
    if(this.options.log)
      console.log("Bundled stylus");
    this.emit("stylusBundle", css);
  }

}
