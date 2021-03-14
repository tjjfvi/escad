import { Component, GenericComponent } from "./Component"
import { ExtensibleFunction } from "./ExtensibleFunction"
import { Hkt } from "./Hkt"
import { Realm } from "./Realm"
import { RealmThing } from "./RealmThing"
import { Thing } from "./Thing"

export interface RealmComponent<I extends any[], O extends Thing, C> extends Component<I, O> {
  (...args: I): RealmThing<O, C>,
}

export const RealmComponent = {
  create:
    <I extends any[], O extends Thing, C>(realm: Realm<C>, component: Component<I, O>): RealmComponent<I, O, C> => {
      const that = Object.assign(
        new ExtensibleFunction(
          (...args: I) => RealmThing.create<any, C>(realm, component(...args)),
          {},
          component.name,
        ),
        {
          type: "Component" as const,
          func: component.func,
          overrideHierarchy: component.overrideHierarchy,
          hierarchy: component.hierarchy,
        },
      ) as RealmComponent<I, O, C>
      return that
    },
}

// eslint-disable-next-line max-len
export interface RealmGenericComponent<T, I extends Hkt<T, any[]>, O extends Hkt<T, Thing>, C> extends GenericComponent<T, I, O> {
  <U extends T>(...args: Hkt.Output<I, U>): RealmThing<Hkt.Output<O, U>, C>,
}

