import React from "../deps/react.ts";
import { EditorPane } from "./EditorPane.tsx";
import { ClientFrame } from "./ClientFrame.tsx";
import { ProjectPane } from "./ProjectPane.tsx";

export const App = () => (
  <>
    <ProjectPane />
    <EditorPane />
    <ClientFrame />
  </>
);
