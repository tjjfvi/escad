
import { Connection } from "./Connection";

export const filterConnection =
  <T, U extends T>(connection: Connection<T>, filter: (v: T) => v is U): Connection<U> => {
    const cbMap = new Map<(v: U) => void, (v: T) => void>();
    return ({
      send: connection.send,
      onMsg: origCb => {
        const newCb = cbMap.get(origCb) ?? ((v: T) => filter(v) && origCb(v));
        cbMap.set(origCb, newCb);
        return connection.onMsg(newCb);
      },
      offMsg: origCb => {
        const cb = cbMap.get(origCb);
        if(cb)
          connection.offMsg(cb);
      },
      destroy: connection.destroy,
    })
  }

/* istanbul ignore next: covered by types */
filterConnection.string = <T>(connection: Connection<T>): Connection<string & T> =>
  filterConnection<T, string & T>(connection, (v): v is string & T => typeof v === "string")
