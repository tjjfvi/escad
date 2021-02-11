
import * as monaco from "monaco-editor";
import { fds, fsEventEmitter } from "./monkeyPatch";
import { autoInstall } from "./npm";
import { debounce } from "./utils";
import fs from "fs";
import { ModuleResolutionKind } from "typescript";
import { compile } from "./webpack";
import path from "path";

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
  moduleResolution: ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const editor = monaco.editor.create(document.getElementById("monaco")!)

export const addFile = (path: string, code: string) => {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(code, path);
  monaco.editor.createModel(code, "typescript", monaco.Uri.parse(path));
}

fs.mkdirSync("/project");

const defaultCode = `
// Hello World!
`;

const code = localStorage.code ?? defaultCode;

const mainModel = monaco.editor.createModel("", "typescript", monaco.Uri.parse("/project/index.ts"));

editor.setModel(mainModel);

mainModel.onDidChangeContent(debounce(async () => {
  const content = mainModel.getValue()
  localStorage.code = content;
  fs.writeFileSync("/project/index.ts", content);
  await autoInstall(content);
  syncDeps("/project/index.ts", content);
  compile();
}, 1000))

mainModel.setValue(code);

const files = new Set<string>();
const allFiles = new Set<string>();
const changedFiles = new Set<string>();
fsEventEmitter.on("rename", (a, b) => changedFiles.add(a).add(b))
fsEventEmitter.on("writeFile", a => changedFiles.add(a))
fsEventEmitter.on("writeFileSync", a => changedFiles.add(a))
fsEventEmitter.on("appendFile", a => changedFiles.add(a))
fsEventEmitter.on("appendFileSync", a => changedFiles.add(a))
fsEventEmitter.on("rm", a => changedFiles.add(a))
fsEventEmitter.on("rmSync", a => changedFiles.add(a))
fsEventEmitter.on("rmdir", a => changedFiles.add(a))
fsEventEmitter.on("rmdirSync", a => changedFiles.add(a))
fsEventEmitter.on("write", a => changedFiles.add(fds[a]._path))
fsEventEmitter.on("writeSync", a => changedFiles.add(fds[a]._path))

fsEventEmitter.on("*", debounce(() => {
  for(const file of changedFiles)
    if(relevantFile(file))
      allFiles.add(file)
  for(const changed of changedFiles) {
    if(changed === "/project/index.ts" || !changed.startsWith("/project/")) continue;
    for(const file of files) {
      syncFile(file);
    }
  }
  changedFiles.clear();
}, 500))

function relevantFile(file: string): boolean{
  return (
    file.startsWith("/project/") &&
    file.startsWith(file) &&
    (file.endsWith(".d.ts") || file.endsWith("/package.json"))
  )
}

function syncFile(file: string){
  files.add(file);
  const uri = monaco.Uri.parse(file);
  let realContent: string | undefined;
  try {
    realContent = fs.readFileSync(file, "utf8");
  } catch (e) {
    e;
  }
  if(realContent === undefined) {
    monaco.editor.getModel(uri)?.dispose();
    files.delete(file);
    return
  }
  let augmentedContent = syncDeps(file, realContent);
  if(file.endsWith("/package.json"))
    augmentedContent = `import _ = require("${getModuleFileName(getTypesField(file, augmentedContent))}");\nexport = _;`
  augmentedContent = `declare module "${getModuleFileName(file)}" {\n${augmentedContent}\n}`;
  (monaco.editor.getModel(uri) ?? monaco.editor.createModel("", "typescript", uri)).setValue(augmentedContent);
  monaco.languages.typescript.typescriptDefaults.addExtraLib(augmentedContent, file)
}

function getTypesField(file: string, content: string){
  const json = JSON.parse(content);
  return path.resolve(path.dirname(file), json.types ?? json.typings ?? "index.d.ts");
}

function getModuleFileName(file: string){
  const partialPath = file.split("node_modules/").slice(-1)[0].split("@types/").slice(-1)[0]
  if(partialPath.endsWith("/package.json"))
    return path.dirname(partialPath);
  else if(partialPath.endsWith(".d.ts"))
    return partialPath.slice(0, -".d.ts".length);
  else
    return partialPath
}

function getModuleName(file: string){
  const moduleFileName = getModuleFileName(file);
  return moduleFileName.split("/").slice(0, moduleFileName[0] === "@" ? 2 : 1).join("/");
}

function syncDeps(file: string, content: string): string{
  const regex = /((?:from|import)\s+(["']))(.+?)\2|((?:import|require)\s*\(\s*(["']))(.+?)(\5\s*\))/g

  if(file.endsWith("/package.json")) {
    syncFile(getTypesField(file, content));
    return content;
  }

  return content.replace(regex, (...m) => {
    let specifier = m[3] ?? m[6];
    let filter = specifier;
    if(specifier.startsWith("."))
      filter = specifier = path.resolve(path.dirname(file), specifier);
    else if(specifier === getModuleName(specifier))
      filter = `node_modules/${specifier}/package.json`
    else
      filter = "node_modules/" + specifier;
    for(const dep of allFiles)
      if(dep.includes(filter) && !files.has(dep) && dep !== file)
        syncFile(dep);
    return (m[1] ?? m[4]) + getModuleFileName(specifier) + (m[7] ?? m[2]);
  })
}

console.log(fs);
