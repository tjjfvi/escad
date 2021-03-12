
import { Connection } from "./Connection";
import { Messenger, MessengerImpl, MessengerShape } from "./Messenger";

export const createMessenger = (
  <F extends MessengerShape, T extends MessengerShape>(
    impl: MessengerImpl<F, T>,
    connection: Connection<unknown>,
  ): Messenger<F, T> => {
    let idN = 0;
    let resolveMap = Object.create(null)
    let rejectMap = Object.create(null)
    let iteratorMap = Object.create(null)
    let destroyed = false;
    const other = new Proxy(Object.create(null), {
      get: (target, prop) => {
        if(destroyed)
          throw new Error("Attempted to make request on destroyed messenger")
        if(prop in target)
          return target[prop];
        if(typeof prop === "symbol")
          return;
        return target[prop] = (...args: any[]) => {
          const id = ++idN
          connection.send(["call", id, prop, ...args]);
          return Object.assign(
            recvPromise(id),
            {
              [Symbol.asyncIterator]: () => ({
                next: () => {
                  const id2 = ++idN
                  connection.send(["next", id, id2]);
                  return recvPromise(id2);
                },
              }),
            },
          );
        };
      },
    });
    (impl as any).req = other;
    (impl as any).destroy = () => {
      destroyed = true;
      resolveMap = Object.create(null);
      rejectMap = Object.create(null);
      iteratorMap = Object.create(null);
      connection.offMsg(handler);
      connection.destroy?.();
    };
    const handler = (msg: unknown) => {
      if(!msg || !(msg instanceof Array))
        return;
      const [kind, id, key, ...args] = msg;
      if(typeof id !== "number" || typeof key !== "number" && typeof key !== "string" && key !== null)
        return;
      switch(kind) {
        case "call": {
          const result = impl[key]?.(...args) ?? Promise.reject(new Error(`No method with the key "${key}"`));
          if("then" in result)
            sendPromise(id, result);
          else if(Symbol.asyncIterator in result)
            iteratorMap[id] = result[Symbol.asyncIterator]();
          return;
        }
        case "next": {
          sendPromise(+key, iteratorMap[id].next());
          return;
        }
        case "resolve": {
          if(id in resolveMap)
            resolveMap[id](args[0]);
          delete resolveMap[id];
          return;
        }
        case "reject": {
          if(id in rejectMap)
            rejectMap[id](args[0]);
          delete rejectMap[id];
          return;
        }
      }
    }
    connection.onMsg(handler);
    return impl as any;

    function recvPromise(id: number){
      return new Promise((resolve, reject) => {
        resolveMap[id] = resolve;
        rejectMap[id] = reject
      });
    }

    function sendPromise(id: number, promise: Promise<unknown>){
      promise.then(
        value =>
          !destroyed && connection.send(["resolve", id, null, value]),
        value =>
          !destroyed && connection.send(["reject", id, null, value]),
      )
    }
  }
)
