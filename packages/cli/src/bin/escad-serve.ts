#!/usr/bin/env node --harmony-weak-refs

import commander from "commander";
import path from "path";
import os from "os";
import fs from "fs";
import { createServer } from "../server";

(() => {
  commander
    .usage("[options] <file>")
    .option("-p, --port <port>", "port to host server on", "8080")
    .option("-d, --watch-dir <dir>", "directory to watch (default: basedir of <file>)")
    .option("--artifacts <dir>", "artifact directory", path.join(os.tmpdir(), "escad-artifacts"))
    .option("--clean", "clean artifacts directory")
    .option("--dev", "run server in dev mode")
    .parse(process.argv);

  if(commander.args.length !== 1)
    return commander.outputHelp();

  let { port, watchDir, artifacts: artifactsDir, clean, dev } = commander.opts();
  artifactsDir = path.resolve(artifactsDir);
  let [file] = commander.args;

  if(clean)
    fs.rmdirSync(artifactsDir, { recursive: true });

  const loadFile = path.resolve(file);
  const loadDir = path.dirname(path.resolve(watchDir || loadFile));

  createServer({
    artifactsDir,
    port: +port,
    loadFile,
    loadDir,
    dev,
  });
})();
