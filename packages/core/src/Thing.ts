
import { Component, ComponentConstraint } from "./Component";
import { Operation, OperationConstraint } from "./Operation";
import { Element, ElementConstraint } from "./Element";

export type Thing = Element<any> | Component<any[], any> | Operation<any, any>;
export type ThingConstraint = ElementConstraint<any> | ComponentConstraint<any[], any> | OperationConstraint<any, any>;
export type ThingFromConstraint<T extends ThingConstraint> =
  T extends ElementConstraint<infer P>
    ? Element<P>
    : T extends ComponentConstraint<infer I, infer P>
      ? Component<I, P>
      : T extends OperationConstraint<infer I, infer O>
        ? Operation<I, O>
        : never

export const Thing = {
  isThing: (value: unknown): value is Thing =>
    Element.isElement(value) ||
    Component.isComponent(value) ||
    Operation.isOperation(value),
  fromThingConstraint: <T extends ThingConstraint>(value: T): ThingFromConstraint<T> => {
    if(ElementConstraint.isElementConstraint(value))
      return Element.fromElementConstraint(value) as never;
    if(ComponentConstraint.isComponentConstraint(value))
      return Component.fromComponentConstraint(value) as never;
    if(OperationConstraint.isOperationConstraint(value))
      return Operation.fromOperationConstraint(value) as never;
    else
      throw new Error("Invalid value passed to Thing.fromThingConstraint");
  }
}

export const ThingConstraint = {
  isThingConstraint: (value: unknown): value is ThingConstraint =>
    ElementConstraint.isElementConstraint(value) ||
    ComponentConstraint.isComponentConstraint(value) ||
    OperationConstraint.isOperationConstraint(value)
}
