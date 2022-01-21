
import { Component, GenericComponent } from "./Component.ts"
import { GenericOperation, Operation } from "./Operation.ts"
import { Element } from "./Element.ts"
import { Realm } from "./Realm.ts"
import { RealmElement } from "./RealmElement.ts"
import { RealmGenericOperation, RealmOperation } from "./RealmOperation.ts"
import { RealmComponent, RealmGenericComponent } from "./RealmComponent.ts"
import { Thing } from "./Thing.ts"

export type RealmThing<T extends Thing, C> =
  | T extends Element<infer T> ? RealmElement<T, C>
  : T extends GenericComponent<infer T, infer I, infer O> ? RealmGenericComponent<T, I, O, C>
  : T extends Component<infer I, infer O> ? RealmComponent<I, O, C>
  : T extends GenericOperation<infer I, infer O> ? RealmGenericOperation<I, O, C>
  : T extends Operation<infer I, infer O> ? RealmOperation<I, O, C>
  : never

export const RealmThing = {
  create: <T extends Thing, C>(realm: Realm<C>, thing: T): RealmThing<T, C> => {
    if(Element.isElement(thing))
      return RealmElement.create<any, C>(realm, thing) as never
    if(Operation.isOperation(thing))
      return RealmOperation.create<any, any, C>(realm, thing) as never
    if(Component.isComponent(thing))
      return RealmComponent.create<any, any, C>(realm, thing) as never
    throw new Error("Invalid thing passed to RealmThing.create")
  },

}
