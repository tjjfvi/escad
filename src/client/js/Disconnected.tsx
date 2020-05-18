/* @flow */

import React from "react";
import state from "./State";
import { observer } from "rhobo";

const Disconnected = observer(() =>
  <div className={"Disconnected " + (state.connected() ? "" : "show")}/>
);

export default Disconnected;
