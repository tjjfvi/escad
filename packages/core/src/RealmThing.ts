
import { Component } from "./Component";
import { Operation } from "./Operation";
import { Element } from "./Element";
import { Realm } from "./Realm";
import { RealmElement } from "./RealmElement";
import { RealmOperation } from "./RealmOperation";
import { RealmComponent } from "./RealmComponent";
import { StripRealm, Thing } from "./Thing";

export type RealmThing<T extends Thing, C> =
  | (T extends Element<infer T> ? RealmElement<T, C> : never)
  | (T extends Component<infer I, infer T> ? RealmComponent<I, StripRealm<T>, C> : never)
  | (T extends Operation<infer I, infer O> ? RealmOperation<I, O, C> : never)

export const RealmThing = {
  create: <T extends Thing, C>(realm: Realm<C>, thing: T): RealmThing<T, C> => {
    if(Element.isElement(thing))
      return RealmElement.create(realm, thing) as never
    if(Operation.isOperation(thing))
      return RealmOperation.create(realm, thing) as never
    if(Component.isComponent(thing))
      return RealmComponent.create(realm, thing) as never
    throw new Error("Invalid thing passed to RealmThing.create");
  }

}
