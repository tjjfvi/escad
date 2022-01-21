#!/usr/bin/env node

import commander from "commander.ts";
import path from "path.ts";
import os from "os.ts";
import fs from "fs.ts";
import { createServer } from "../server.ts";
(() => {
  commander
    .usage("[options] <file>")
    .option("-p, --port <port>", "port to listen on", "8080")
    .option("--ip <address>", "IP address to listen on", "::")
    .option(
      "-d, --watch-dir <dir>",
      "directory to watch (default: basedir of <file>)",
    )
    .option(
      "--artifacts <dir>",
      "artifact directory",
      path.join(os.tmpdir(), "escad-artifacts"),
    )
    .option("--clean", "clean artifacts directory")
    .option("--dev", "run server in dev mode")
    .parse(process.argv);

  if (commander.args.length !== 1) {
    return commander.outputHelp();
  }

  console.log(commander.opts());
  let { port, ip, watchDir, artifacts: artifactsDir, clean, dev } = commander
    .opts();
  artifactsDir = path.resolve(artifactsDir);
  let [file] = commander.args;

  if (clean) {
    fs.rmdirSync(artifactsDir, { recursive: true });
  }

  const loadFile = path.resolve(file);
  const loadDir = path.dirname(path.resolve(watchDir || loadFile));

  createServer({
    artifactsDir,
    port: +port,
    ip,
    loadFile,
    loadDir,
    dev,
  });
})();
