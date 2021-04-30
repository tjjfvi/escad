/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Connection } from "./Connection"

export type MessengerShape = Record<string, (...args: any[]) => Promise<unknown>>
export type EventsShape = Record<string, readonly unknown[]>
export type Messenger<
  F extends MessengerShape,
  T extends MessengerShape,
  E extends EventsShape
> = T & {
  impl: F,
  destroy(): void,
  emit<K extends keyof E>(event: K, iterable: AsyncIterable<E[K]>): void,
  emit<K extends keyof E>(event: K, ...args: E[K]): void,
  on<K extends keyof E>(event: K, callback: (...args: E[K]) => void): () => void,
  on<K extends keyof E>(event: K): AsyncIterable<E[K]>,
  once<K extends keyof E>(event: K, callback: (...args: E[K]) => void): void,
  once<K extends keyof E>(event: K): Promise<E[K]>,
}

export const createMessenger = (
  <F extends MessengerShape, T extends MessengerShape, E extends EventsShape>({
    impl,
    connection,
    onDestroy,
  }: {
    impl: F,
    connection: Connection<unknown>,
    onDestroy?: Array<() => void>,
  }): Messenger<F, T, E> => {
    let idN = 0
    let resolveMap: Record<number, (value: any) => void> = Object.create(null)
    let eventMap: Record<string, Set<(...args: any[]) => void>> = Object.create(null)
    let destroyed = false
    const other: T = new Proxy(Object.create(null), {
      get: (target, prop) => {
        if(destroyed)
          throw new Error("Attempted to make request on destroyed messenger")
        if(prop in target)
          return target[prop]
        if(typeof prop === "symbol")
          return
        return target[prop] = (...args: any[]) => {
          const id = ++idN
          connection.send(["call", id, prop, ...args])
          return recvPromise(id)
        }
      },
    })
    const result = Object.assign(
      Object.create(other) as T,
      {
        impl,
        then: undefined,
        destroy(){
          destroyed = true
          resolveMap = Object.create(null)
          eventMap = Object.create(null)
          connection.offMsg(handler)
          connection.destroy?.()
          onDestroy?.forEach(x => x())
        },
        emit(event: string, ...args: readonly any[]){
          if(
            args.length === 1
            && (typeof args[0] === "object" || typeof args[0] === "function")
            && args[0]
            && Symbol.asyncIterator in args[0]
          ) {
            const iterable = args[0]
            ;(async () => {
              for await (const args of iterable) {
                if(destroyed) break
                this.emit(event, ...args)
              }
            })()
            return
          }
          eventMap[event]?.forEach(cb => cb(...args))
          connection.send(["event", -1, event, ...args])
        },
        on(event: string, callback?: (...args: readonly any[]) => void){
          if(callback) {
            (eventMap[event] ??= new Set()).add(callback)
            return () => eventMap[event]?.delete(callback)
          }

          const valueQueue: any[][] = []
          const callbackQueue: Array<(value: IteratorYieldResult<any[]>) => void> = []
          let finished = false

          const listener = (...value: any[]) => {
            const callback = callbackQueue.shift()
            if(callback)
              callback({ done: false, value })
            else
              valueQueue.push(value)
          }

          ;(eventMap[event] ??= new Set()).add(listener)

          return {
            next(){
              if(valueQueue.length)
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return Promise.resolve({ done: false, value: valueQueue.shift()! })

              if(finished || destroyed)
                return Promise.resolve({ done: true, value: undefined })

              return new Promise<IteratorYieldResult<any[]>>(resolve => callbackQueue.push(resolve))
            },

            return(){
              eventMap[event]?.delete(listener)
              finished = true
              return Promise.resolve({ done: true, value: undefined })
            },

            [Symbol.asyncIterator](){
              return this
            },
          }
        },
        once(event: string, callback?: (...args: readonly any[]) => void){
          let result
          if(!callback) result = new Promise<readonly any[]>(resolve => callback = (...args) => resolve(args))
          const callback2 = (...args: any[]) => {
            eventMap[event]?.delete(callback2)
            callback!(...args)
          }
          ;(eventMap[event] ??= new Set()).add(callback2)
          return result
        },
      },
    ) as unknown as Messenger<F, T, E>
    const handler = (msg: unknown) => {
      if(!msg || !(msg instanceof Array))
        return
      const [kind, id, key, ...args] = msg
      if(typeof id !== "number" || typeof key !== "number" && typeof key !== "string" && key !== null)
        return
      switch(kind) {
        case "call": {
          const result = impl[key]?.(...args) ?? Promise.reject(new Error(`No method with the key "${key}"`))
          sendPromise(id, result)
          return
        }
        case "resolve": {
          if(id in resolveMap)
            resolveMap[id](args[0])
          delete resolveMap[id]
          return
        }
        case "event": {
          eventMap[key]?.forEach(cb => cb(...args))
        }
      }
    }
    connection.onMsg(handler)
    return result

    function recvPromise(id: number){
      return new Promise(resolve => resolveMap[id] = resolve)
    }

    function sendPromise(id: number, promise: Promise<unknown>){
      promise.then(value =>
        !destroyed && connection.send(["resolve", id, null, value]),
      )
    }
  }
)
