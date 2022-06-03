import { Accessor, createSignal } from "../deps/solid.ts";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";

export function trackRendererActive(
  messenger: ClientServerMessenger,
): Accessor<boolean> {
  let [active, setActive] = createSignal(false);
  let checkQueued = false;

  messenger.connection.onMsg(queueCheck);

  const send = messenger.connection.send;
  messenger.connection.send = (value) => {
    queueCheck();
    return send(value);
  };

  return active;

  function queueCheck() {
    if (checkQueued) return;
    checkQueued = true;
    setTimeout(() => {
      checkQueued = false;
      setActive(!!messenger.getRunningCount());
    }, 0);
  }
}
