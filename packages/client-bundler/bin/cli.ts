#!/usr/bin/env node

import { bundle } from "../bundler";

import commander from "commander";

commander
  .usage("[options] <directory>")
  .option("-w, --watch", "Enable watch mode")
  .parse(process.argv);

const { watch } = commander;
const [dir] = commander.args;

bundle(dir, watch).then(() => {
  if (!watch)
    process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
})
