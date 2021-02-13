
import { mdiCheck, mdiClose, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useContext } from "react";
import { observer } from "rhobo";
import { ClientState } from "./ClientState";

export type Status = "connected" | "disconnected" | "reload";

const statusDatas: Record<Status, { name: string, icon: string, onClick?: () => void }> = {
  connected: {
    name: "Connected",
    icon: mdiCheck,
  },
  disconnected: {
    name: "Disconnected",
    icon: mdiClose,
  },
  reload: {
    name: "Reload Required",
    icon: mdiRefresh,
    onClick: () => window.location.reload(),
  },
}

export const Status = observer(() => {
  const state = useContext(ClientState.Context);
  const status = state.status();
  const statusData = statusDatas[status];
  const className = "Status " + status + (statusData.onClick ? " clickable" : "")
  return <div className={className} onClick={statusData.onClick}>
    <Icon path={statusData.icon}/>
    <span>{statusData.name}</span>
  </div>
}
);
