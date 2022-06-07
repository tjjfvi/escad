import { Connection } from "./Connection.ts";

/* istanbul ignore next: covered by types, noisy to test */
export const logConnection = <T>(
  connection: Connection<T>,
  ...label: string[]
): Connection<T> => {
  const off = connection.onMsg((value) => {
    console.log(...label, "recv", ...([] as unknown[]).concat(value));
  });
  return {
    send: (value) => {
      console.log(...label, "send", ...([] as unknown[]).concat(value));
      connection.send(value);
    },
    onMsg: (cb) => {
      return connection.onMsg(cb);
    },
    destroy: () => {
      off();
      connection.destroy?.();
    },
  };
};
