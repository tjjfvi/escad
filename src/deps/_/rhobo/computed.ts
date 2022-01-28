import { Readable, readable } from "./readable.ts";
import { Writeable, writeable } from "./writeable.ts";
import { use_ } from "./use_.ts";

export function computed<T>(get: () => T): Readable<T>;
export function computed<T>(
  get: () => T,
  set: (value: T) => unknown,
): Writeable<T>;
export function computed<T>(get: () => T, set?: (value: T) => unknown) {
  if (set) {
    return writeable(get, set);
  }
  return readable(get);
}

export const comp = computed;
export const c = comp;

export const useComputed = use_(computed);
export const useComp = useComputed;
export const useC = useComp;
