
import React from "react";
import { Disconnected } from "./Disconnected";
import { ParametersPane } from "./ParametersPane";
import { Preview } from "./Preview";

export const App = () => <>
  <ParametersPane/>
  <Preview/>
  <Disconnected/>
</>
