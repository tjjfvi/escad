import { EventsShape } from "./Messenger.ts";

export class EventEmitter<E extends EventsShape> {
  static readonly _anyEvent = Symbol("_anyEvent");

  callbacks: Record<keyof any, Set<(...args: any[]) => void>> = Object
    .create(null);
  destroyed = false;

  emit<K extends keyof E>(
    event: K,
    iterable: AsyncIterable<E[K]>,
  ): Promise<void>;
  emit<K extends keyof E>(event: K, ...args: E[K]): void;
  emit(event: keyof any, ...args: any): Promise<void> | void {
    if (this.destroyed) {
      throw new Error("Attempted to emit on destroyed emitter");
    }
    if (
      args.length === 1 &&
      (typeof args[0] === "object" || typeof args[0] === "function") &&
      args[0] &&
      Symbol.asyncIterator in args[0]
    ) {
      const iter = args[0] as AsyncIterable<any>;
      return (async () => {
        for await (const args of iter) {
          if (this.destroyed) break;
          this.emit(event as any, ...args);
        }
      })();
    }
    for (const cb of this.callbacks[EventEmitter._anyEvent] ?? []) {
      cb(event, ...args);
    }
    for (const cb of this.callbacks[event] ?? []) {
      cb(...args);
    }
  }

  on<K extends keyof E>(
    event: K,
    callback: (...args: E[K]) => void,
  ): () => void;
  on<K extends keyof E>(event: K): AsyncIterableIterator<E[K]>;
  on(
    event: keyof any,
    callback?: (...args: any) => void,
  ): AsyncIterableIterator<any> | (() => void) {
    if (this.destroyed) {
      throw new Error("Attempted to listen on destroyed emitter");
    }
    if (callback) {
      (this.callbacks[event] ??= new Set()).add(callback);
      return () => this.callbacks[event]?.delete(callback);
    }
    const valueQueue: any[][] = [];
    const callbackQueue: Array<
      (value: IteratorYieldResult<any[]>) => void
    > = [];
    let finished = false;

    const listener = (...value: any[]) => {
      const callback = callbackQueue.shift();
      if (callback) {
        callback({ done: false, value });
      } else {
        valueQueue.push(value);
      }
    };
    (this.callbacks[event] ??= new Set()).add(listener);

    return {
      next: () => {
        if (valueQueue.length) {
          return Promise.resolve({ done: false, value: valueQueue.shift()! });
        }

        if (finished || this.destroyed) {
          return Promise.resolve({ done: true, value: undefined });
        }

        return new Promise<IteratorYieldResult<any[]>>((resolve) =>
          callbackQueue.push(resolve)
        );
      },

      return: () => {
        this.callbacks[event]?.delete(listener);
        finished = true;
        return Promise.resolve({ done: true, value: undefined });
      },

      [Symbol.asyncIterator](this: AsyncIterableIterator<any>) {
        return this;
      },
    };
  }

  once<K extends keyof E>(event: K, callback: (...args: E[K]) => void): void;
  once<K extends keyof E>(event: K): Promise<E[K]>;
  once(
    event: keyof any,
    callback?: (...args: any) => void,
  ): Promise<any> | undefined {
    if (this.destroyed) {
      throw new Error("Attempted to listen on destroyed emitter");
    }
    let result;
    if (!callback) {
      result = new Promise<readonly any[]>((resolve) =>
        callback = (...args) => resolve(args)
      );
    }
    const callback2 = (...args: any[]) => {
      this.callbacks[event]?.delete(callback2);
      callback!(...args);
    };
    (this.callbacks[event] ??= new Set()).add(callback2);
    return result;
  }

  destroy() {
    this.destroyed = true;
    this.callbacks = Object.create(null);
  }
}
