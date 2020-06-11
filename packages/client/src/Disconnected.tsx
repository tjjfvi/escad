
import React from "react";
import { observer } from "rhobo";
import { messenger } from "./Messenger";

export const Disconnected = observer(() =>
  <div className={"Disconnected " + (messenger.connected() ? "" : "show")} />
);
