
import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import { observer } from "rhobo";
import { messenger } from "./Messenger";

export type Status = "connected" | "disconnected";

const statusData: Record<Status, { name: string, icon: string }> = {
  connected: {
    name: "Connected",
    icon: mdiCheck,
  },
  disconnected: {
    name: "Disconnected",
    icon: mdiClose,
  },
}

export const Status = observer(() => {
  const status = messenger.status();
  return <div className={"Status " + status}>
    <Icon path={statusData[status].icon}/>
    <span>{statusData[status].name}</span>
  </div>
}
);
