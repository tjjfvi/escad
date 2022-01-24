// @deno-types="./_/rhobo.d.ts"
import { default as rhobo } from "https://esm.sh/rhobo@0.3.6?dev";

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
