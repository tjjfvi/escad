import {
  _GCU,
  Component,
  GenericComponent,
  GenericConstraint,
} from "./Component.ts";
import { ExtensibleFunction } from "./ExtensibleFunction.ts";
import { type Hkt } from "./Hkt.ts";
import { Realm } from "./Realm.ts";
import { RealmThing } from "./RealmThing.ts";
import { Thing } from "./Thing.ts";

export interface RealmComponent<I extends any[], O extends Thing, C>
  extends Component<I, O> {
  (...args: I): RealmThing<O, C>;
}

export const RealmComponent = {
  create: <I extends any[], O extends Thing, C>(
    realm: Realm<C>,
    component: Component<I, O>,
  ): RealmComponent<I, O, C> => {
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
        info: component.info,
      },
    ) as RealmComponent<I, O, C>;
    return that;
  },
};

export interface RealmGenericComponent<
  T extends GenericConstraint,
  I extends Hkt<T, any[]>,
  O extends Hkt<T, Thing>,
  C,
> extends GenericComponent<T, I, O> {
  <
    U0 extends T[0],
    U1 extends T[1],
    U2 extends T[2],
    U3 extends T[3],
    U4 extends T[4],
  >(
    ...args: Hkt.Output<I, _GCU<T, U0, U1, U2, U3, U4>>
  ): RealmThing<Hkt.Output<O, _GCU<T, U0, U1, U2, U3, U4>>, C>;
}
