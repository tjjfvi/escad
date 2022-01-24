import monacoLoader from "https://esm.sh/@monaco-editor/loader@1.2.0?dev";
export const monaco = await monacoLoader.init();
export { default as Editor } from "https://esm.sh/@monaco-editor/react@4.3.1?dev";
