import { ExtensibleFunction } from "./ExtensibleFunction";
import { Product } from "./Product";
import { Element, Elementish } from "./Element";
import { Operation } from "./Operation";
import { RealmElement } from "./RealmElement";
import { Component } from "./Component";
import { Realm } from "./Realm";
import { RealmThing } from "./RealmThing";
import { RealmComponent } from "./RealmComponent";

type RealmOperationOut<I extends Product, O extends Product, Arg, C> =
  [I] extends [Product] ? [O] extends [Product] ?
    | (Arg extends Element<infer I_> ? [I_] extends [I] ? RealmElement<O, C> : never : never)
    | (Arg extends Operation<infer T, I> ? RealmOperation<T, O, C> : never)
    | (Arg extends Component<infer A, infer T> ? Component<A, RealmOperationOut<I, O, T, C>> : never)
    | (Arg extends Realm<unknown> ? RealmOperation<I, O, C> : never)
  : never : never

export type RealmOperation<I extends Product, O extends Product, C> =
  & Omit<Operation<I, O>, never>
  & ExcludeNevers<{ [K in keyof C]: RealmOperationOut<I, O, C[K], C> }>
  & {
    _: RealmOperation<I, O, C>,
    (...args: Elementish<I>[]): RealmElement<O, C>,
    <A>(o: A): RealmOperationOut<I, O, A, C>,
  }

type ExcludeNevers<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }

export const RealmOperation = {
  create:
    <I extends Product, O extends Product, C>(realm: Realm<C>, operation: Operation<I, O>): RealmOperation<I, O, C> => {
      const { chainables } = realm;
      const that = Object.assign(
        new ExtensibleFunction(
          (...args) => {
            if(Realm.isRealm(args[0]))
              return that;
            if(Operation.isOperation(args[0]))
              return RealmOperation.create(realm, Operation.create(
                operation.name + "+" + args[0].name,
                (a: any) => that(args[0](...a.val)) as any,
                { overrideHierarchy: false },
              ));
            if(Component.isComponent(args[0]))
              return RealmComponent.create(realm, Component.create(
                args[0].name + "+" + operation.name,
                (...a: any) => (that as any)((args[0](...a) as any)),
                { overrideHierarchy: false },
              ));
            return RealmThing.create(realm, operation(...args));
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
            },
          },
          operation.name,
        ),
        {
          type: "Operation" as const,
          func: operation.func,
          hierarchy: operation.hierarchy,
          overrideHierarchy: operation.overrideHierarchy,
        },
      ) as any;
      return that;
    },
}
