import { debounce } from "./debounce.ts";
import { transpiler } from "./server.ts";
import React from "../deps/react.ts";
import { Pane } from "../client/Pane.tsx";
import { Editor, monaco } from "./monaco/mod.ts";
import { putVfs } from "./vfs.ts";
import { instanceId } from "./instanceId.ts";

export const EditorPane = () => (
  <Pane name="Editor" left defaultWidth={750} minWidth={200} defaultOpen={true}>
    <Editor
      onMount={(editor) => {
        augmentMonacoEditor(editor);
      }}
      options={{
        minimap: {
          enabled: false,
        },
        scrollbar: {
          useShadows: false,
        },
        // renderIndentGuides: false,
        tabSize: 2,
      }}
      defaultLanguage="typescript"
      theme={"escad"}
    />
  </Pane>
);

monaco.editor.defineTheme("escad", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#151820",
  },
});

export const augmentMonacoEditor = (
  editor: monaco.editor.IStandaloneCodeEditor,
) => {
  const defaultCode = `
import escad from "${location.origin}/core/mod.ts";
import "${location.origin}/builtins/register.ts";

export default () =>
  escad
    .cube({ size: 1 })
    .sub(escad.cube({ size: .9 }))
    .sub(escad.cube({ size: 1, shift: 1 }))
`;

  let code = defaultCode;
  // let code = localStorage.code ?? defaultCode;
  if (location.hash.startsWith("#code=")) {
    // code = lzstring.decompressFromEncodedURIComponent(
    //   location.hash.slice("#code=".length),
    // );
  }

  const mainModel = monaco.editor.createModel(
    "",
    "typescript",
    monaco.Uri.parse("/project/index.ts"),
  );

  editor.setModel(mainModel);

  mainModel.onDidChangeContent(debounce(onChange, 1000));

  mainModel.setValue(code);

  const files = new Set();

  onChange();

  async function addFile(url: string) {
    if (files.has(url)) return;
    files.add(url);
    const fileName = url
      .replace("://", "/")
      .replace(/[^\w/.-]/g, "_");
    const response = await fetch(url);
    if (!response.ok) {
      return console.error(`Could not add dependency ${url} to monaco`);
    }
    const content = await response.text();
    const uri = monaco.Uri.file(fileName + ".ts");
    let mod = monaco.editor.createModel("", "typescript", uri);
    mod.setValue(content);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      content,
      uri.toString(),
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `declare module "${url}" { export * from "${fileName}"; export { default } from "${fileName}" }`,
      uri.toString() + "/__alias",
    );
    console.log(`Added dependency ${url} to monaco`);
    addDeps(url, content);
  }

  async function addDeps(url: string, content: string) {
    for (let match of content.matchAll(/(?:from|import) (["'])(.+?)\1/g)) {
      addFile(new URL(match[2], url).toString());
    }
  }

  async function onChange() {
    const content = mainModel.getValue();
    localStorage.code = content;
    addDeps("file:///main.ts", editor.getValue());
    await putVfs(`${instanceId}/main.ts`, content);
    transpiler.transpile(
      new URL(`/vfs/${instanceId}/main.ts`, import.meta.url).toString(),
      true,
    );
  }

  return editor;
};
