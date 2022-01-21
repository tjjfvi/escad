import { Compiler, Stats } from "webpack.ts";
import { Connection, createMessenger } from "../messages/mod.ts";
import { BundleOptions, BundlerServerMessenger } from "../protocol/mod.ts";
import { Hash } from "../core/mod.ts";
import { writeFile } from "fs-extra.ts";
import stylus from "stylus.ts";
import path from "path.ts";
import fs from "fs.ts";

export const createBundlerServerMessenger = (
  connection: Connection<unknown>,
  createCompiler: (
    options: BundleOptions,
    entryPaths: string[],
  ) => Compiler | Promise<Compiler>,
): BundlerServerMessenger => {
  let watcher: ReturnType<Compiler["watch"]> | undefined;

  let lastOptionsHash: Hash<BundleOptions> | undefined;

  const messenger: BundlerServerMessenger = createMessenger({
    impl: {
      bundle,
    },
    connection,
  });

  return messenger;

  async function bundle(options: BundleOptions) {
    const optionsHash = Hash.create(options);
    if (optionsHash === lastOptionsHash) {
      return;
    }
    lastOptionsHash = optionsHash;

    const entryPaths = [
      options.coreClientPath,
      ...options.clientPlugins.map((reg) => reg.path),
    ];

    watcher?.close(() => {});
    watcher = undefined;

    const compiler = await createCompiler(options, entryPaths);

    compiler.hooks.beforeCompile.tap("@escad/bundler", () => {
      messenger.emit("bundleStart");
    });

    // @ts-ignore: fix for running in browser
    compiler.inputFileSystem.join = fs.join;

    return await new Promise<void>((resolve, reject) => {
      const handler = (err: Error | undefined, result: Stats | undefined) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        const bundleHash = Hash.create(
          result?.compilation.fullHash ?? Math.random(),
        );
        writeFile(path.join(options.outDir, "bundle.hash"), bundleHash);
        messenger.emit("bundleFinish", bundleHash);
        resolve();
      };

      if (options.watch ?? false) {
        watcher = compiler.watch({}, handler);
      } else {
        compiler.run(handler);
      }
    });
  }
};

const hex = (value: number) => {
  // Webpack deep clones the config, so there can't be a circular reference,
  // and stylus requires one level of .rgba for normalization.
  const values = [
    (value >> 16) % 256,
    (value >> 8) % 256,
    (value >> 0) % 256,
    1,
  ] as const;
  const color = new stylus.nodes.RGBA(...values);
  color.rgba = new stylus.nodes.RGBA(...values);
  delete (color as any).rgba.rgba;
  return color;
};

export const stylusGlobals: unknown = {
  $black: hex(0x151820),
  $darkgrey: hex(0x252830),
  $grey: hex(0x454850),
  $lightgrey: hex(0x656870),
  $white: hex(0xbdc3c7),
  $red: hex(0xc0392b),
  $orange: hex(0xd35400),
  $yellow: hex(0xf1c40f),
  $green: hex(0x2ecc71),
  $blue: hex(0x0984e3),
  $purple: hex(0x8e44ad),
};
