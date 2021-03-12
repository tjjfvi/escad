
import { Connection } from "./Connection"
import flatted from "flatted"

export const mapConnection =
  <T, U>(connection: Connection<T>, serialize: (v: U) => T, deserialize: (v: T) => U): Connection<U> => {
    const cbMap = new Map<(v: U) => void, (v: T) => void>()
    return ({
      send: v => connection.send(serialize(v)),
      onMsg: origCb => {
        const newCb = cbMap.get(origCb) ?? ((v: T) => origCb(deserialize(v)))
        cbMap.set(origCb, newCb)
        return connection.onMsg(newCb)
      },
      offMsg: origCb => {
        const cb = cbMap.get(origCb)
        if(cb)
          connection.offMsg(cb)
      },
      destroy: connection.destroy,
    })
  }

mapConnection.json = (connection: Connection<string>): Connection<unknown> =>
  mapConnection(connection, JSON.stringify, JSON.parse)

mapConnection.flatted = (connection: Connection<string>): Connection<unknown> =>
  mapConnection(connection, flatted.stringify, flatted.parse)

mapConnection.log = <T>(connection: Connection<T>): Connection<T> =>
  mapConnection(
    connection,
    value => {
      console.log("send", value)
      return value
    },
    value => {
      console.log("recv", value)
      return value
    },
  )
