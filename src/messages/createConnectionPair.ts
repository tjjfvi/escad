import { Connection } from "./Connection.ts";

export const createConnectionPair = <T, U = T>(): [
  Connection<T, U>,
  Connection<U, T>,
] => {
  const aListeners = new Set<(value: T) => void>();
  const bListeners = new Set<(value: U) => void>();
  const a: Connection<T, U> = {
    send: (value) => aListeners.forEach((fn) => fn(value)),
    onMsg: (cb) => {
      bListeners.add(cb);
      return () => bListeners.delete(cb);
    },
  };
  const b: Connection<U, T> = {
    send: (value) => bListeners.forEach((fn) => fn(value)),
    onMsg: (cb) => {
      aListeners.add(cb);
      return () => aListeners.delete(cb);
    },
  };
  return [a, b];
};
