
import { Compiler, Stats } from "webpack"
import { Connection, createEmittableAsyncIterable, createMessenger } from "@escad/messages";
import { BundleOptions, BundlerServerMessenger } from "@escad/protocol";
import { Hash } from "@escad/core";
import { writeFile } from "fs-extra";
import stylus from "stylus";
import path from "path";
import fs from "fs";

export const createBundlerServerMessenger = (
  connection: Connection<unknown>,
  createCompiler: (options: BundleOptions, entryPaths: string[]) => Compiler,
): BundlerServerMessenger => {
  const [emitBundle, onBundle] = createEmittableAsyncIterable<Hash<unknown>>();

  let watcher: ReturnType<Compiler["watch"]> | undefined;

  let lastOptionsHash: Hash<BundleOptions> | undefined;

  return createMessenger({
    bundle,
    onBundle,
  }, connection);

  function bundle(options: BundleOptions){
    return new Promise<void>((resolve, reject) => {
      const optionsHash = Hash.create(options);
      if(optionsHash === lastOptionsHash)
        return;
      lastOptionsHash = optionsHash;

      const entryPaths = [options.coreClientPath, ...options.clientPlugins.map(reg => reg.path)];

      watcher?.close(() => {});
      watcher = undefined;

      const compiler = createCompiler(options, entryPaths);

    // @ts-ignore: fix for running in browser
      compiler.inputFileSystem.join = fs.join;

      const handler = (err: Error | undefined, result: Stats | undefined) => {
        if(err) {
          console.error(err);
          reject(err);
          return;
        }
        const bundleHash = Hash.create(result?.compilation.fullHash ?? Math.random());
        writeFile(path.join(options.outDir, "bundle.hash"), bundleHash);
        emitBundle(bundleHash);
        resolve();
      }

      if(options.watch ?? false)
        watcher = compiler.watch({}, handler);
      else
        compiler.run(handler);
    })
  }
}

const literal = (value: string) => {
  const literal = new stylus.nodes.Literal(value);
  literal.filename = "globals.styl";
  return literal;
}

export const stylusGlobals: unknown = {
  $black: literal("#151820"),
  $darkgrey: literal("#252830"),
  $grey: literal("#454850"),
  $lightgrey: literal("#656870"),
  $white: literal("#bdc3c7"),
  $red: literal("#c0392b"),
  $orange: literal("#d35400"),
  $yellow: literal("#f1c40f"),
  $green: literal("#2ecc71"),
  $blue: literal("#0984e3"),
  $purple: literal("#8e44ad"),
};
