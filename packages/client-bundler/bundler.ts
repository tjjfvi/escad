
/* eslint-disable no-console */

import browserify from "browserify";
import fs from "fs-extra";
import stylus from "stylus";
import watchDir from "node-watch";
import path from "path";

export async function bundle(folder: string, watch: boolean) {
  const dist = path.join(folder, "dist");
  const src = path.join(folder, "src");

  const b = browserify(path.join(src, "ts/index.tsx"), {
    cache: {},
    packageCache: {},
    debug: true,
    plugin: ["watchify", "tsify"],
  })

  function bundleTs() {
    return new Promise<void>((res, rej) => {
      console.log("Bundling client TS...");
      b.bundle()
        .on("end", () => {
          console.log("Bundled client TS");
          res();
        })
        .on("error", e => {
          console.error(e);
          rej();
        })
        .pipe(fs.createWriteStream(path.join(dist, "bundle.js")));
    });
  }

  async function bundleStylus() {
    console.log("Bundling stylus...");
    let css = await new Promise((r, j) => stylus.render(
      `@import '${path.join(src, "stylus/*")}'`,
      {
        filename: "_.styl",
        // @ts-ignore
        sourcemap: {
          comment: false,
          inline: true,
          basePath: path.join(src, "stylus/"),
        },
      },
      (e: any, css: any) => e ? j(e) : r(css),
    ));
    await fs.writeFile(path.join(dist, "bundle.css"), css);
    console.log("Bundled stylus");
  }

  await bundleTs();
  await bundleStylus();
  await fs.copyFile(path.join(dist, "index.html"), path.join(dist, "index.html"))

  if (watch) {
    b.on("update", bundleTs);
    watchDir(path.join(src, "stylus/"), {
      persistent: false,
      recursive: true,
    }, bundleStylus);
  }
}

