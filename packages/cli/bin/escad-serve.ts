#!/usr/bin/env node --harmony-weak-refs

import commander from "commander";
import path from "path";
import os from "os";
import fs from "fs";

(() => {
  commander
    .usage("[options] <file>")
    .option("-p, --port <port>", "port to host server on", "8080")
    .option("-d, --watch-dir <dir>", "directory to watch (default: basedir of <file>)")
    .option("--artifacts <dir>", "artifact directory", path.join(os.tmpdir(), "escad-artifacts"))
    .option("--clean", "clean artifacts directory")
    .parse(process.argv);

  if(commander.args.length !== 1)
    return commander.outputHelp();

  let { port, watchDir, artifacts: artifactsDir, clean } = commander;
  artifactsDir = path.resolve(artifactsDir);
  let [file] = commander.args;

  if(clean)
    fs.rmdirSync(artifactsDir, { recursive: true });

  const loadFile = path.resolve(file);
  const loadDir = path.dirname(path.resolve(watchDir || loadFile));

  Object.assign(require("@escad/server/dist/config").default, { port: +port, loadFile, loadDir, artifactsDir });

  require("@escad/server");
})();
