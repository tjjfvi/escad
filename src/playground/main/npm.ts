import { installProjectPromise } from "./initialize.ts";
// @ts-ignore
import Arborist = require("@npmcli/arborist");
import { escadPackageTgzs } from "../utils/escadPackages.ts";

let deps: string[] = [];
let currentOperation: Promise<unknown> = installProjectPromise;

const arborist = new Arborist({
  registry: "https://registry.npmjs.cf/",
  path: "/project/",
  audit: false,
});

export function install(newDeps: string[]) {
  const lastOperation = currentOperation;
  return currentOperation = (async () => {
    await lastOperation;
    const add = newDeps.filter((d) => !deps.includes(d));
    if (!add.length) {
      return;
    }
    console.log(`Install ${add.length}`);
    deps = [...deps, ...add];
    await arborist.reify({
      add,
      // rm,
      audit: false,
    });
  })();
}

const defaultDeps = [
  ...escadPackageTgzs.map((p) => `/packages/${p}`),
];
deps = defaultDeps;

const depRegex = /^\/\/ @dep(?:endency)?s? (.+)$/;
export function autoInstall(source: string) {
  const deps: string[] = [...defaultDeps];
  for (const line of source.split("\n")) {
    if (!line.trim()) {
      continue;
    }
    if (!line.match(depRegex)) {
      break;
    }
    deps.push(
      ...depRegex.exec(line)?.[1].split(" ").filter((x) => x.trim()) ?? [],
    );
  }
  return install(deps);
}
