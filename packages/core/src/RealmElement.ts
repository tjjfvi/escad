
import { Product } from "./Product";
import { Element } from "./Element";
import { Component } from "./Component";
import { Operation } from "./Operation";
import { Realm } from "./Realm";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { ConvertibleTo } from "./Conversions";
import { RealmComponent } from "./RealmComponent";

export type ConvertibleRealmElement<T extends Product, C> = RealmElement<ConvertibleTo<T>, C>

export type RealmElementOut<T extends Product, Arg, C> =
  [T] extends [infer T_] ? [T_] extends [infer T] ? [T] extends [Product] ?
    | (Arg extends Element<infer U> ? RealmElement<T | U, C> : never)
    | (Arg extends Operation<infer I, infer O> ? T extends I ? RealmElement<O, C> : never : never)
    | (Arg extends Component<infer I, infer O> ? RealmComponent<I, RealmElementOut<T, O, C>, C> : never)
    | (Arg extends Realm<unknown> ? RealmElement<T, C> : never)
  : never : never : never

export type RealmElement<T extends Product, C> =
  & Element<T>
  & (0 extends 1 & T ? unknown : ExcludeNevers<{ [K in keyof C]: RealmElementOut<T, C[K], C> }>)
  & {
    _: RealmElement<T, C>,
    (): RealmElement<T, C>,
    <A>(arg: A): RealmElementOut<T, A, C>,
  }

type ExcludeNevers<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }

export const RealmElement = {
  create: <T extends Product, C>(realm: Realm<C>, element: Element<T>): RealmElement<T, C> => {
    const chainables = realm.chainables;
    const that = Object.assign(
      new ExtensibleFunction(
        arg => {
          if(!arg || Realm.isRealm(arg))
            return that;
          if(Operation.isOperation(arg))
            return RealmElement.create(realm, arg(that));
          if(Component.isComponent(arg))
            return RealmComponent.create(realm, Component.create(
              arg.name + "'",
              (...args) => that(arg(...args)),
              false,
            ));
          if(Element.isElement(arg))
            return RealmElement.create(realm, Element.concat(that, arg));
          throw new Error("Invalid argument to RealmElement");
        },
        {
          get: (target, prop) => {
            if(prop === "_") return that;

            if(prop in target)
              return target[prop as never];

            if(!(prop in chainables) || typeof prop === "symbol")
              return;

            const val = chainables[prop as never];
            return that(val);
          }
        }
      ),
      element,
    ) as any
    return that;
  }
}
