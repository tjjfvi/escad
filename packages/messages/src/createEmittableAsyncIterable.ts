
export const createEmittableAsyncIterable = <T>() => {
  let listeners = new Set<(value: T) => void>();

  return [
    (value: T) => {
      const oldListeners = listeners;
      listeners = new Set();
      oldListeners.forEach(fn => fn(value));
    },
    async function*(): AsyncIterable<T>{
      while(true)
        yield await new Promise(res => listeners.add(res))
    }
  ] as const;
}
