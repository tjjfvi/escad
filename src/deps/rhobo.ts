import rhobo from "./_rhobo.js";

export const {
  Observable,
  Readable,
  Writeable,
  computed,
  observable,
  observer,
  useObservable,
  useComputed,
  fromProm,
  fromPromise,
  useFromProm,
  useFromPromise,
  useValue,
} = rhobo;

export type Observable<T> = rhobo.Observable<T>;
export type Readable<T> = rhobo.Readable<T>;
export type Writeable<T> = rhobo.Writeable<T>;
