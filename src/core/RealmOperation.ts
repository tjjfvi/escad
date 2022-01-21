import { ExtensibleFunction } from "./ExtensibleFunction.ts"
import { Product } from "./Product.ts"
import { Element, Elementish } from "./Element.ts"
import { GenericOperation, Operation } from "./Operation.ts"
import { RealmElement } from "./RealmElement.ts"
import { Component, GenericComponent } from "./Component.ts"
import { Realm } from "./Realm.ts"
import { RealmThing } from "./RealmThing.ts"
import { RealmComponent, RealmGenericComponent } from "./RealmComponent.ts"
import { Hkt } from "./Hkt.ts"

type Assert<T, U extends T> = U

type RealmOperationOut<I extends Product, O extends Product, Arg, C> =
  [I] extends [Product] ? [O] extends [Product] ?
    | Arg extends Element<I> ? RealmElement<O, C>
    : Arg extends GenericOperation<infer T, Assert<Hkt<infer T, I>, infer U>>
      ? RealmGenericOperation<T, Hkt.Compose<Product, Hkt.Constant<O>, U>, C>
    : Arg extends Operation<infer T, I> ? RealmOperation<T, O, C>
    : Arg extends GenericComponent<infer G, infer A, infer T>
      ? RealmGenericComponent<G, A, Hkt.Compose<G, RealmOperationOutHkt<I, O, C>, T>, C>
    : Arg extends Component<infer A, infer T> ? Component<A, RealmOperationOut<I, O, T, C>>
    : Arg extends { type: "Realm" } ? RealmOperation<I, O, C>
    : never
  : never : never

interface RealmOperationOutHkt<I extends Product, O extends Product, C> extends Hkt {
  [Hkt.output]: RealmOperationOut<I, O, Hkt.Input<this>, C>,
}

type RealmGenericOperationOut<I extends Product, O extends Hkt<I, Product>, Arg, C> =
  [I] extends [Product] ? [O] extends [Hkt<I, Product>] ?
    | Arg extends Element<Assert<I, infer J>> ? RealmElement<Hkt.Output<O, J>, C>
    : Arg extends GenericOperation<infer T, Assert<Hkt<infer T, I>, infer U>>
      ? RealmGenericOperation<T, Hkt.Compose<Product, O, U>, C>
    : Arg extends Operation<infer T, Assert<I, infer U>>
      ? RealmGenericOperation<T, Hkt.Compose<Product, O, Hkt.Constant<U, T>>, C>
    : Arg extends Component<infer A, infer T> ? Component<A, RealmGenericOperationOut<I, O, T, C>>
    : Arg extends { type: "Realm" } ? RealmGenericOperation<I, O, C>
    : never
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
      const { chainables } = realm
      const that = Object.assign(
        new ExtensibleFunction(
          (...args) => {
            if(Realm.isRealm(args[0]))
              return that
            if(Operation.isOperation(args[0]))
              return RealmOperation.create(realm, Operation.create(
                operation.name + "+" + args[0].name,
                (a: any) => that(args[0](...a.val)) as any,
                { overrideHierarchy: false },
              ))
            if(Component.isComponent(args[0]))
              return RealmComponent.create(realm, Component.create(
                args[0].name + "+" + operation.name,
                (...a: any) => (that as any)((args[0](...a) as any)),
                { overrideHierarchy: false },
              ))
            return RealmThing.create(realm, operation(...args))
          },
          {
            get: (target, prop) => {
              if(prop === "_") return that

              if(prop in target)
                return target[prop as never]

              if(!(prop in chainables) || typeof prop === "symbol")
                return

              const val = chainables[prop as never]
              return that(val)
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
      ) as any
      return that
    },
}

export type RealmGenericOperation<I extends Product, O extends Hkt<I, Product>, C> =
  & Omit<GenericOperation<I, O>, never>
  & ExcludeNevers<{ [K in keyof C]: RealmGenericOperationOut<I, O, C[K], C> }>
  & {
    _: RealmGenericOperation<I, O, C>,
    <J extends I>(...args: Elementish<J>[]): RealmElement<Hkt.Output<O, J>, C>,
    <A>(o: A): RealmGenericOperationOut<I, O, A, C>,
  }
