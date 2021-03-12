
import { Component } from "./Component"
import { Operation } from "./Operation"
import { Element } from "./Element"
import { Hierarchy } from "./Hierarchy"

export type Thing = Element<any> | Component<any[], any> | Operation<any, any>
export type StripRealm<T extends Thing> =
  | (T extends Element<infer P> ? Element<P> : never)
  | (T extends Component<any, any> ? T : never)
  | (T extends Operation<infer I, infer O> ? Operation<I, O> : never)

export const Thing = {
  isThing: (value: unknown): value is Thing =>
    Element.isElement(value)
    || Component.isComponent(value)
    || Operation.isOperation(value),
  applyHierarchy: <T extends Thing>(thing: T, hierarchy?: Hierarchy): StripRealm<T> => {
    if(Element.isElement(thing))
      return Element.applyHierarchy(thing, hierarchy) as never
    if(Operation.isOperation(thing))
      return Operation.applyHierarchy(thing, hierarchy) as never
    if(Component.isComponent(thing))
      return Component.applyHierarchy(thing, hierarchy) as never
    throw new Error("Invalid thing passed to RealmThing.create")
  },
  stripRealm: <T extends Thing>(thing: T): StripRealm<T> =>
    Thing.applyHierarchy(thing, thing.hierarchy),
}
