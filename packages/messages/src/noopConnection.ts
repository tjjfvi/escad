
import { Connection } from "./Connection";

export const noopConnection = <T>(): [Connection<T>, Connection<T>] => {
  const aListeners: Set<(value: T) => void> = new Set<(value: T) => void>();
  const bListeners: Set<(value: T) => void> = new Set<(value: T) => void>();
  const a: Connection<T> = {
    send: value => aListeners.forEach(fn => fn(value)),
    onMsg: cb => bListeners.add(cb),
    offMsg: cb => bListeners.delete(cb),
  }
  const b: Connection<T> = {
    send: value => bListeners.forEach(fn => fn(value)),
    onMsg: cb => aListeners.add(cb),
    offMsg: cb => aListeners.delete(cb),
  }
  return [a, b];
}
