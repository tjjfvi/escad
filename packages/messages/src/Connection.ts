
export interface Connection<T> {
  send: (value: T) => void,
  onMsg: (cb: (value: T) => void) => void,
  offMsg: (cb: (value: T) => void) => void,
}
