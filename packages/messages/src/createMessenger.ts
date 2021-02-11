
import { Connection } from "./Connection";
import { Messenger, MessengerImpl, MessengerShape } from "./Messenger";

export const createMessenger = (
  <F extends MessengerShape, T extends MessengerShape>(
    impl: MessengerImpl<F, T>,
    socket: Connection<unknown>,
  ): Messenger<F, T> => {
    let idN = 0;
    const resolveMap = Object.create(null)
    const rejectMap = Object.create(null)
    const iteratorMap = Object.create(null)
    const other = new Proxy(Object.create(null), {
      get: (target, prop) => {
        if(prop in target)
          return target[prop];
        if(typeof prop === "symbol")
          return;
        return target[prop] = (...args: any[]) => {
          const id = ++idN
          socket.send(["call", id, prop, ...args]);
          return Object.assign(
            recvPromise(id),
            {
              [Symbol.asyncIterator]: () => ({
                next: () => {
                  const id2 = ++idN
                  socket.send(["next", id, id2]);
                  return recvPromise(id2);
                },
              })
            }
          );
        };
      }
    });
    (impl as any).req = other;
    socket.onMsg(msg => {
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
    })
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
          socket.send(["resolve", id, null, value]),
        value =>
          socket.send(["reject", id, null, value]),
      )
    }
  }
)
