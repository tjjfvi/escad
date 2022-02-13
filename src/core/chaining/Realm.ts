import { checkTypeProperty } from "../utils/mod.ts";
import { Product } from "../product/mod.ts";
import { Element, Elementish } from "./Element.ts";
import { ExtensibleFunction } from "./ExtensibleFunction.ts";
import { RealmElement } from "./RealmElement.ts";
import { RealmThing } from "./RealmThing.ts";
import { Thing } from "./Thing.ts";

export type Realm<C> =
  & {
    readonly type: "Realm";
    readonly chainables: C;
  }
  & { [K in keyof C]: C[K] extends Thing ? RealmThing<C[K], C> : never }
  & {
    _: Realm<C>;
    (): RealmElement<never, C>;
    <A extends Thing>(a: A): RealmThing<A, C>;
    <T extends Product>(...args: Elementish<T>[]): RealmElement<T, C>;
  };

export const Realm = {
  create: <C>(chainablesFn: () => C) => {
    let chainables: C | undefined;
    const that = Object.assign(
      new ExtensibleFunction(
        (...args) => {
          if (args.length !== 1) {
            return RealmElement.create<any, C>(that, Element.create(args));
          }
          if (Thing.isThing(args[0])) {
            return RealmThing.create<any, C>(that, args[0]);
          }
          return RealmElement.create<any, C>(that, Element.create(args[0]));
        },
        {
          get: (target, prop) => {
            if (prop === "_") return that;

            if (prop in target) {
              return target[prop as never];
            }

            chainables ??= chainablesFn();

            if (prop === "chainables") {
              return chainables;
            }

            if (!(prop in chainables) || typeof prop === "symbol") {
              return;
            }

            const val = chainables[prop as never];
            return that(val);
          },
        },
      ),
      {
        type: "Realm" as const,
      },
    ) as Realm<C>;
    return that;
  },
  isRealm: checkTypeProperty.string<Realm<unknown>>("Realm"),
};
