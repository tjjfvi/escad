import { Product } from "./Product.ts";
import { Element } from "./Element.ts";
import { Component, GenericComponent } from "./Component.ts";
import { GenericOperation, Operation } from "./Operation.ts";
import { Realm } from "./Realm.ts";
import { ExtensibleFunction } from "./ExtensibleFunction.ts";
import { ConvertibleTo } from "./Conversions.ts";
import { RealmComponent, RealmGenericComponent } from "./RealmComponent.ts";
import { type Hkt } from "./Hkt.ts";

export type ConvertibleRealmElement<T extends Product, C> = RealmElement<
  ConvertibleTo<T>,
  C
>;

export type RealmElementOut<T extends Product, Arg, C> = [T] extends [infer T_]
  ? [T_] extends [infer T]
    ? [T] extends [Product]
      ? Arg extends Element<infer U> ? RealmElement<T | U, C>
      : Arg extends GenericOperation<T, infer O>
        ? RealmElement<Hkt.Output<O, T>, C>
      : Arg extends Operation<T, infer O> ? RealmElement<O, C>
      : Arg extends GenericComponent<infer G, infer I, infer O>
        ? RealmGenericComponent<
          G,
          I,
          Hkt.Compose<G, RealmElementOutHkt<T, C>, O>,
          C
        >
      : Arg extends Component<infer I, infer O>
        ? RealmComponent<I, RealmElementOut<T, O, C>, C>
      : Arg extends { type: "Realm" } ? RealmElement<T, C>
      : never
    : never
  : never
  : never;

interface RealmElementOutHkt<T extends Product, C> extends Hkt {
  [Hkt.output]: RealmElementOut<T, Hkt.Input<this>, C>;
}

export type RealmElement<T extends Product, C> =
  & Element<T>
  & (0 extends 1 & T ? unknown
    : ExcludeNevers<{ [K in keyof C]: RealmElementOut<T, C[K], C> }>)
  & {
    _: RealmElement<T, C>;
    (): RealmElement<T, C>;
    <A>(arg: A): RealmElementOut<T, A, C>;
  };

type ExcludeNevers<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export const RealmElement = {
  create: <T extends Product, C>(
    realm: Realm<C>,
    element: Element<T>,
  ): RealmElement<T, C> => {
    const chainables = realm.chainables;
    const that = Object.assign(
      new ExtensibleFunction(
        (arg) => {
          if (!arg || Realm.isRealm(arg)) {
            return that;
          }
          if (Operation.isOperation(arg)) {
            return RealmElement.create<any, C>(realm, arg(that));
          }
          if (Component.isComponent(arg)) {
            return RealmComponent.create<any, any, C>(
              realm,
              Component.create(
                arg.name + "'",
                (...args) => that(arg(...args)),
                { overrideHierarchy: false },
              ),
            );
          }
          if (Element.isElement(arg)) {
            return RealmElement.create<any, C>(
              realm,
              Element.concat(that, arg),
            );
          }
          throw new Error("Invalid argument to RealmElement");
        },
        {
          get: (target, prop) => {
            if (prop === "_") return that;

            if (prop in target) {
              return target[prop as never];
            }

            if (!(prop in chainables) || typeof prop === "symbol") {
              return;
            }

            const val = chainables[prop as never];
            return that(val);
          },
        },
      ),
      element,
    ) as any;
    return that;
  },
};
