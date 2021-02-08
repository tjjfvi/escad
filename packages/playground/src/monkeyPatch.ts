// @ts-nocheck

import path = require("path");
import fs = require("fs");
import fsConstants = require("fs-constants");
import util = require("util");
import EventEmitter = require("events");
import url = require("url");

declare const BrowserFS: any;

url.URL = URL;

BrowserFS.configure({
  fs: "InMemory",
}, () => {});

fs.constants = fsConstants;
fs.copyFile = () => {};
fs.promises = {
  stat: util.promisify(fs.stat)
}
fs.symlink = (_, _2, _3, c) => c();
fs.symlinkSync = () => {}
fs.chmod = (_, _1, c) => c();
fs.chmodSync = () => {}
const fsWrite = fs.write;
fs.write = (fd, buf, offset = 0, length = buf.length - offset, position, cb) => {
  fsWrite(fd, buf, offset, length, position, (...args) => {
    cb(...args)
    const fdInfo = fds[fd];
    fd in fds && fs.closeSync(fd);
    fds[fd] = fdInfo;
  })
}
const fsWriteSync = fs.writeSync;
fs.writeSync = (fd, buf, offset = 0, length = buf.length - offset, position) => {
  fsWriteSync(fd, buf, offset, length, position)
  const fdInfo = fds[fd];
  fd in fds && fs.closeSync(fd);
  fds[fd] = fdInfo;
}
fs.join = path.posix.join;
fs.unlink = (_, cb) => cb(null);
const fsRmdir = fs.rmdir;
fs.rmdir = (...args) => fsRmdir(args[0], { recursive: true }, args[args.length - 1])

export const fsEventEmitter = new EventEmitter();

Object.keys(fs).filter(x => typeof fs[x] === "function").forEach(x => {
  const orig = fs[x];
  fs[x] = (...args) => {
    fsEventEmitter.emit("*", x, ...args);
    fsEventEmitter.emit(x, ...args);
    return orig(...args);
  }
})

// fsEventEmitter.on("*", console.log)

export const fds: Record<number, { _path: string }> = fs.getFSModule().fdMap;

process.binding = x => x === "fs" ? fs : null
process.getMaxListeners = () => Infinity
process.versions = {};

window.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
