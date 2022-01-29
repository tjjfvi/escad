export interface Connection<T, U = T> {
  send: (value: T) => void;
  onMsg: (cb: (value: U) => void) => () => void;
  destroy?: () => void;
}
