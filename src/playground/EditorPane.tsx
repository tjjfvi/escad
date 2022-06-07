/** @jsxImportSource solid */
import { ProjectManager } from "./projectManager.ts";
import { Pane } from "../client/Pane.tsx";
import { monaco } from "../deps/monaco.ts";
import { createEffect } from "../deps/solid.ts";

export const EditorPane = (props: { projectManager: ProjectManager }) => {
  const container = <div style="width: 100%; height: 100%" /> as HTMLDivElement;
  const editor = monaco.editor.create(container, {
    model: monaco.editor.createModel(
      "",
      "typescript",
      monaco.Uri.parse("/project/index.ts"),
    ),
    theme: "escad",
    minimap: {
      enabled: false,
    },
    scrollbar: {
      useShadows: false,
    },
    guides: {
      indentation: false,
    },
    tabSize: 2,
    automaticLayout: true,
  });
  createEffect(() => {
    augmentMonacoEditor(editor, props.projectManager);
  });
  return (
    <Pane
      name="Editor"
      side="left"
      defaultWidth={600}
      minWidth={200}
      defaultOpen={true}
    >
      {container}
    </Pane>
  );
};

monaco.editor.defineTheme("escad", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#151820",
  },
});

const depsRegex = /(from\s*|import\s*)(["'])(.+?)\2/g;

export const augmentMonacoEditor = (
  editor: monaco.editor.IStandaloneCodeEditor,
  projectManager: ProjectManager,
) => {
  const mainModel = editor.getModel()!;

  mainModel.onDidChangeContent(debounce(onChange, 1000));

  mainModel.setValue(projectManager.getCode());

  const files = new Set();
  const bannedCharacters = /[^\w/.-]/g;
  let aliasesUri = monaco.Uri.parse("file:///aliases");
  let aliasesContent = "";

  onChange().then(() => mainModel.setValue(mainModel.getValue()));

  async function addFile(url: string) {
    if (files.has(url)) return;
    files.add(url);
    const fileName = url
      .replace("://", "/")
      .replace(bannedCharacters, "_");
    const response = await fetch(url);
    if (!response.ok) {
      return console.error(`Could not add dependency ${url} to monaco`);
    }
    let content = await response.text();
    let children: Promise<unknown>[] = [];
    content = content.replace(
      depsRegex,
      (...match) => {
        children.push(addFile(new URL(match[3], url).toString()));
        if (match[3].match(/^\w+:\/\//)) {
          return match[0];
        } else {
          return match[1] + match[2] + match[3].replace(bannedCharacters, "_") +
            match[2];
        }
      },
    );
    addLib(monaco.Uri.file(fileName + ".ts"), content);
    addLib(
      aliasesUri,
      aliasesContent +=
        `declare module "${url}" { export * from "${fileName}"; export { default } from "${fileName}" }\n`,
    );

    console.log(`Added dependency ${url} to monaco (${fileName})`);

    await Promise.all(children);

    function addLib(uri: monaco.Uri, content: string) {
      (
        monaco.editor.getModel(uri) ??
          monaco.editor.createModel("", "typescript", uri)
      ).setValue(content);
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        content,
        uri.toString(),
      );
    }
  }

  function addDeps(url: string, content: string) {
    return content.replace(/(from\s*|import\s*)(["'])(.+?)\2/g, (...match) => {
      addFile(new URL(match[3], url).toString());
      if (match[3].match(/^\w+:\/\//)) {
        return match[0];
      } else {
        return match[1] + match[2] + match[3].replace(bannedCharacters, "_") +
          match[2];
      }
    });
  }

  projectManager.events.on("codeChange", (value) => {
    if (value !== mainModel.getValue()) {
      mainModel.setValue(value);
    }
  });

  async function onChange() {
    const value = mainModel.getValue();
    if (value !== projectManager.getCode()) {
      projectManager.setCode(value);
    }
    await Promise.all(
      [...value.matchAll(depsRegex)].map((x) => addFile(x[3])),
    );
  }

  return editor;
};

const debounce = (fn: () => void, amount: number) => {
  let timer: number | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, amount) as any as number;
  };
};
