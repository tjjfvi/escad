import { Connection } from "./Connection.ts";
import { EventEmitter } from "./EventEmitter.ts";

export type MessengerShape = Record<
  string,
  (...args: any[]) => Promise<unknown>
>;
export type EventsShape = Record<string, readonly unknown[]>;
export type Messenger<
  F extends MessengerShape,
  T extends MessengerShape,
  E extends EventsShape,
> = T & {
  impl: F;
  connection: Connection<unknown[], unknown>;
  destroy(): void;
  getRunningCount(): number;
  retryAll(): void;
  emit<K extends keyof E>(event: K, iterable: AsyncIterable<E[K]>): void;
  emit<K extends keyof E>(event: K, ...args: E[K]): void;
  on<K extends keyof E>(
    event: K,
    callback: (...args: E[K]) => void,
  ): () => void;
  on<K extends keyof E>(event: K): AsyncIterable<E[K]>;
  once<K extends keyof E>(event: K, callback: (...args: E[K]) => void): void;
  once<K extends keyof E>(event: K): Promise<E[K]>;
  // For type inference
  [__messengerSymb]?: T;
};
declare const __messengerSymb: unique symbol;

export const createMessenger = <
  F extends MessengerShape,
  T extends MessengerShape,
  E extends EventsShape,
>({
  impl,
  connection,
  onDestroy,
}: {
  impl: F;
  connection: Connection<unknown[], unknown>;
  onDestroy?: Array<() => void>;
}): Messenger<F, T, E> => {
  let sendIdN = 0;
  let recvIdN = 0;
  let destroyed = false;
  const tasks = new Map<number, Task>();
  const emitter = new EventEmitter<any>();
  let skipNextEvent = false;
  emitter.on(
    EventEmitter._anyEvent,
    (event, ...args) => {
      if (skipNextEvent) {
        skipNextEvent = false;
      } else {
        connection.send(["event", event, ...args]);
      }
    },
  );
  const other: T = new Proxy(Object.create(null), {
    get: (target, prop) => {
      if (destroyed) {
        throw new Error("Attempted to make request on destroyed messenger");
      }
      if (prop in target) return target[prop];
      if (typeof prop === "symbol") return;
      return target[prop] = (...args: any[]) => {
        const id = ++sendIdN;
        const message = ["call", id, prop, ...args];
        connection.send(message);
        let resolve!: (value: unknown) => void;
        const promise = new Promise((r) => resolve = r);
        tasks.set(id, {
          id,
          resolve,
          message,
        });
        return promise.then((value) => {
          tasks.delete(id);
          return value;
        });
      };
    },
  });
  const messenger: Messenger<F, T, E> = Object.assign(
    Object.create(other) as T,
    {
      impl,
      connection,
      then: undefined,
      getRunningCount() {
        return tasks.size;
      },
      retryAll() {
        if (destroyed) {
          throw new Error("Attempted to retryAll on destroyed messenger");
        }
        for (const task of tasks.values()) {
          connection.send(task.message);
        }
      },
      destroy() {
        destroyed = true;
        tasks.clear();
        offMsg();
        connection.destroy?.();
        onDestroy?.forEach((x) => x());
      },
      emit: emitter.emit.bind(emitter),
      on: emitter.on.bind(emitter),
      once: emitter.once.bind(emitter),
    },
  );
  const offMsg = connection.onMsg(handleMessage);
  connection.send(["init"]);
  return messenger;

  function handleMessage(msg: unknown) {
    if (!msg || !(msg instanceof Array)) {
      return;
    }
    switch (msg[0]) {
      case "init": {
        recvIdN = 0;
        messenger.retryAll();
        return;
      }
      case "call": {
        const [, id, key, ...args] = msg;
        if (typeof id !== "number") return;
        if (typeof key !== "string" && typeof key !== "number") return;
        if (id <= recvIdN) return;
        recvIdN = id;
        const result = impl[key]?.(...args) ??
          Promise.reject(new Error(`No method with the key "${key}"`));
        result.then((value) =>
          !destroyed && connection.send(["resolve", id, value])
        );
        return;
      }
      case "resolve": {
        const [, id, value] = msg;
        if (typeof id !== "number") return;
        tasks.get(id)?.resolve(value);
        return;
      }
      case "event": {
        const [, key, ...args] = msg;
        if (typeof key !== "string" && typeof key !== "number") return;
        skipNextEvent = true;
        emitter.emit(key, ...args);
        return;
      }
    }
  }
};

interface Task {
  id: number;
  resolve: (value: unknown) => void;
  message: unknown[];
}
