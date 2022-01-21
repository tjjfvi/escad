#!/usr/bin/env node

import commander from "commander.ts";

commander
  // .version(require("../../package.json").version, "-v, --version")
  .command("serve", "host a preview interface on specified port")
  .parse(process.argv);
