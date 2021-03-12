
import * as monaco from "monaco-editor";
import { fds, fsEventEmitter } from "./initialize";
import { autoInstall } from "./npm";
import { debounce } from "../utils/debounce";
import fs from "fs";
import { ModuleResolutionKind } from "typescript";
import path from "path";
import { reloadRenderer } from "./server";
import React from "react";
import Editor from "@monaco-editor/react";
import { Pane } from "@escad/client";
import lzstring from "lz-string";

export const EditorPane = () =>
  <Pane name="Editor" left defaultWidth={750} minWidth={200} defaultOpen={true}>
    <Editor
      onMount={editor => {
        augmentMonacoEditor(editor);
      }}
      options={{
        minimap: {
          enabled: false,
        },
        scrollbar: {
          useShadows: false,
        },
        renderIndentGuides: false,
        tabSize: 2,
      }}
      defaultLanguage="typescript"
      theme={"escad"}
    />
  </Pane>

monaco.editor.defineTheme("escad", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#151820",
    // editorForeground: "#151820",
  },
})

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
  moduleResolution: ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
})

export const augmentMonacoEditor = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const defaultCode = `
import escad from "@escad/core";
import "@escad/builtins/register";

export default () =>
  escad
    .cube({ size: 1 })
    .sub(escad.cube({ size: .9 }))
    .sub(escad.cube({ size: 1, center: false }))
`;

  let code = localStorage.code ?? defaultCode;
  if(location.hash.startsWith("#code="))
    code = lzstring.decompressFromEncodedURIComponent(location.hash.slice("#code=".length))

  const mainModel = monaco.editor.createModel("", "typescript", monaco.Uri.parse("/project/index.ts"));

  editor.setModel(mainModel);

  mainModel.onDidChangeContent(debounce(async () => {
    const content = mainModel.getValue()
    localStorage.code = content;
    history.replaceState({}, "Playground", "#code=" + lzstring.compressToEncodedURIComponent(content))
    fs.writeFileSync("/project/index.ts", content);
    await autoInstall(content);
    syncChangedFiles();
    syncDeps("/project/index.ts", content);
    reloadRenderer();
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

  function syncChangedFiles(){
    for(const file of changedFiles)
      if(relevantFile(file))
        allFiles.add(file)
    for(const changed of changedFiles) {
      if(changed === "/project/index.ts" || !changed.startsWith("/project/")) continue;
      for(const file of files)
        syncFile(file);
    }
    changedFiles.clear();
  }

  function relevantFile(file: string): boolean{
    return (
      file.startsWith("/project/")
    && file.startsWith(file)
    && (file.endsWith(".d.ts") || file.endsWith("/package.json"))
    )
  }

  function syncFile(file: string){
    files.add(file);
    const uri = monaco.Uri.file(`file://${file}`);
    let content: string | undefined;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch (e) {
      e;
    }
    if(content === undefined) {
      monaco.editor.getModel(uri)?.dispose();
      files.delete(file);
      return
    }
    (monaco.editor.getModel(uri) ?? monaco.editor.createModel("", "typescript", uri)).setValue(content);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, `file://${file}`);
    syncDeps(file, content);
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

  function syncDeps(file: string, content: string){
    const regex = /((?:from|import)\s+(["']))(.+?)\2|((?:import|require)\s*\(\s*(["']))(.+?)(\5\s*\))/g

    if(file.endsWith("/package.json"))
      return syncFile(getTypesField(file, content));

    let m: RegExpExecArray | null;

    while((m = regex.exec(content))) {
      let specifier = m[3] ?? m[6];
      if(specifier.startsWith("."))
        specifier = path.resolve(path.dirname(file), specifier);
      else if(specifier === getModuleName(specifier))
        specifier = `node_modules/${specifier}/package.json`
      else
        specifier = "node_modules/" + specifier;
      for(const dep of allFiles)
        if(dep.includes(specifier) && !files.has(dep) && dep !== file)
          syncFile(dep);
    }
  }

  return editor;
}
