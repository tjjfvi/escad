import { Component } from "./Component"
import { ExtensibleFunction } from "./ExtensibleFunction"
import { Realm } from "./Realm"
import { RealmThing } from "./RealmThing"
import { Thing } from "./Thing"

export interface RealmComponent<I extends any[], T extends Thing, C> extends Component<I, T> {
  (...args: I): RealmThing<T, C>,
}

export const RealmComponent = {
  create:
    <I extends any[], T extends Thing, C>(realm: Realm<C>, component: Component<I, T>): RealmComponent<I, T, C> => {
      const that = Object.assign(
        new ExtensibleFunction(
          (...args: I) => RealmThing.create(realm, component(...args)),
          {},
          component.name,
        ),
        {
          type: "Component" as const,
          func: component.func,
          overrideHierarchy: component.overrideHierarchy,
          hierarchy: component.hierarchy,
        },
      ) as RealmComponent<I, T, C>
      return that
    },
}
