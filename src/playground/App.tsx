import React from "../deps/react.ts";
import { EditorPane } from "./EditorPane.tsx";
import { ClientFrame } from "./ClientFrame.tsx";

export const App = () => (
  <>
    <EditorPane />
    <ClientFrame />
  </>
);
