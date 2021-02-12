import { Connection } from "./Connection";

export const createConnection = <T>(send: (value: T) => void): Connection<T> & { emit: (value: T) => void } => {
  const listeners = new Set<(value: T) => void>();
  return {
    send,
    onMsg: cb => listeners.add(cb),
    offMsg: cb => listeners.delete(cb),
    emit: value => listeners.forEach(cb => cb(value)),
  }
}
