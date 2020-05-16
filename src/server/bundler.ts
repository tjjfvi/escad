
/* eslint-disable no-console */

import browserify from "browserify";
import watchify from "watchify";
import fs from "fs-extra";
import stylus from "stylus";
import watch from "node-watch";

const folder = __dirname + "/../client/";

const b = browserify(folder + "/js/index.js", {
  entries: [
    "node_modules/babel-polyfill",
    folder + "/js/index.js",
  ],
  cache: {},
  packageCache: {},
  debug: true,
  plugin: [watchify, "tsify"],
})

b.on("update", bundle);
bundle();

function bundle() {
  console.log("Bundling client JS...");
  b.bundle()
    .on("end", () => console.log("Bundled client JS"))
    .on("error", e => console.error(e))
    .pipe(fs.createWriteStream(folder + "bundle.js"));
}

async function bundleStylus() {
  console.log("Bundling stylus...");
  let css = await new Promise((r, j) => stylus.render(
    `@import '${folder}stylus/*'`,
    {
      filename: "_.styl",
      // @ts-ignore
      sourcemap: {
        comment: false,
        inline: true,
        basePath: folder + "stylus/",
      },
    },
    (e, css) => e ? j(e) : r(css),
  ));
  await fs.writeFile(folder + "bundle.css", css);
  console.log("Bundled stylus");
}

bundleStylus();
watch(folder + "stylus/", {
  persistent: false,
  recursive: true,
}, bundleStylus);
