
import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useContext } from "react";
import { observer } from "rhobo";
import { ClientState } from "./ClientState";

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
  const state = useContext(ClientState.Context);
  const status = state.status();
  return <div className={"Status " + status}>
    <Icon path={statusData[status].icon}/>
    <span>{statusData[status].name}</span>
  </div>
}
);
