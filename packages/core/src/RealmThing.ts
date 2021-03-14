
import { Component, GenericComponent } from "./Component"
import { GenericOperation, Operation } from "./Operation"
import { Element } from "./Element"
import { Realm } from "./Realm"
import { RealmElement } from "./RealmElement"
import { RealmGenericOperation, RealmOperation } from "./RealmOperation"
import { RealmComponent, RealmGenericComponent } from "./RealmComponent"
import { Thing } from "./Thing"

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
