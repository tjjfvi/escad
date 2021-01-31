
import React from "react";
import { Status } from "./Status";
import { HierarchyPane } from "./HierarchyPane";
import { ParametersPane } from "./ParametersPane";
import { Preview } from "./Preview";

export const App = () => <>
  <ParametersPane/>
  <Preview/>
  <Status/>
  <HierarchyPane/>
</>
