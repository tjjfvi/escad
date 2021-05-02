
import { Connection } from "./Connection"

export const transformConnection =
  <T0, U0, T1, U1>(
    connection: Connection<T0, U0>,
    serialize: (v: T1) => T0,
    deserialize: (v: U0) => U1,
  ): Connection<T1, U1> => ({
    send: v => connection.send(serialize(v)),
    onMsg: origCb => connection.onMsg(v => origCb(deserialize(v))),
    destroy: connection.destroy,
  })
