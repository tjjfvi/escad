import { Thing } from "./Thing.ts";

type PickChainables<T> = {
  [K in keyof T]: T[K] extends Thing ? T[K] : never;
};

export function pickChainables<T>(obj: T): PickChainables<T> {
  let chainables: any = {};
  for (let key in obj) {
    if (Thing.isThing(obj[key])) chainables[key] = obj[key];
  }
  return chainables;
}
