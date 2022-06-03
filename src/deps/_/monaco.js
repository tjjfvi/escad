import monacoLoader from "https://esm.sh/@monaco-editor/loader@1.2.0?dev";
monacoLoader.config({
  paths: { vs: "https://typescript.azureedge.net/cdn/4.5.4/monaco/min/vs" },
});
export const monaco = await monacoLoader.init();
