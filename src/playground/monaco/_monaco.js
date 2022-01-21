import monacoLoader from "https://cdn.esm.sh/v64/@monaco-editor/loader@1.2.0/es2021/loader.development.js";
export const monaco = await monacoLoader.init();
export { default as Editor } from "https://cdn.esm.sh/v64/@monaco-editor/react@4.3.1/es2021/react.development.js";
