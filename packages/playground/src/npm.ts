
// @ts-ignore
import Arborist = require("@npmcli/arborist");
import fs from "fs";
import { packages } from "./packages";

let deps: string[] = [];
let currentOperation: Promise<unknown> = Promise.all(packages.map(async p => {
  const arrayBuffer = await fetch(`/packages/${p}`).then(r => r.arrayBuffer());
  fs.writeFileSync(`/packages/${p}`, Buffer.from(arrayBuffer));
}))

const arborist = new Arborist({
  registry: window.location.origin + "/registry/",
  path: "/project/",
});

export function install(newDeps: string[]){
  const lastOperation = currentOperation;
  return currentOperation = (async () => {
    await lastOperation;
    const add = newDeps.filter(d => !deps.includes(d));
    const rm = deps.filter(d => !newDeps.includes(d));
    console.log(`Add ${add.length}, remove ${rm.length}`);
    deps = newDeps;
    if(!rm.length && !add.length)
      return;
    await arborist.reify({
      add,
      rm,
    });
  })();
}

const defaultDeps = packages.map(p => `/packages/${p}`)

const depRegex = /^\/\/ @dep(?:endency)?s? (.+)$/;
export function autoInstall(source: string){
  const deps: string[] = [...defaultDeps];
  for(const line of source.split("\n")) {
    if(!line.trim())
      continue;
    if(!line.match(depRegex))
      break;
    deps.push(...depRegex.exec(line)?.[1].split(" ").filter(x => x.trim()) ?? []);
  }
  return install(deps);
}

fs.mkdirSync("/packages")
