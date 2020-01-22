
/* eslint-disable no-console */

const browserify = require("browserify");
const babelify = require("babelify");
const watchify = require("watchify");
const fs = require("fs-extra");
const stylus = require("stylus");
const watch = require("node-watch");
const { promisify } = require("util");

const folder = __dirname + "/../client/";

const b = browserify(folder + "/js/index.js", {
  entries: [
    "node_modules/babel-polyfill",
    folder + "/js/index.js",
  ],
  cache: {},
  packageCache: {},
  debug: true,
  plugin: [ watchify ],
}).transform(babelify, {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-flow",
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
  ],
  global: true,
  ignore: [/\/node_modules\/(?!rhobo\/)/],
});

b.on("update", bundle);
bundle();

function bundle(){
  console.log("Bundling client JS...");
  b.bundle()
    .on("end", () => console.log("Bundled client JS"))
    .on("error", e => console.error(e))
    .pipe(fs.createWriteStream(folder + "bundle.js"));
}

async function bundleStylus(){
  console.log("Bundling stylus...");
  let css = await promisify(stylus.render)(
    `@import '${folder}stylus/*'`,
    {
      filename: "_.styl",
      sourcemap: {
        comment: false,
        inline: true,
        basePath: folder + "stylus/",
      },
    }
  );
  await fs.writeFile(folder + "bundle.css", css);
  console.log("Bundled stylus");
}

bundleStylus();
watch(folder + "stylus/", {
  persistent: false,
  recursive: true,
}, bundleStylus);
