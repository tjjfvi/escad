
import { checkTypeProperty } from "./checkTypeProperty";
import { contextStack } from "./ContextStack";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { Hierarchy } from "./Hierarchy";
import { Thing, ThingConstraint, ThingFromConstraint } from "./Thing";

export interface ComponentConstraint<I extends any[], T extends ThingConstraint> {
  readonly type: "Component",
  readonly func: (...input: I) => T,
  readonly name: string,
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
}

export const ComponentConstraint = {
  isComponentConstraint: checkTypeProperty<ComponentConstraint<any, any>>("Component"),
}

export interface Component<I extends any[], T extends ThingConstraint> {
  (...args: I): ThingFromConstraint<T>,
}

export class Component<I extends any[], T extends ThingConstraint>
  extends ExtensibleFunction implements ComponentConstraint<I, T> {

  readonly type = "Component";

  constructor(
    name: string,
    public readonly func: (...args: I) => T,
    public readonly overrideHierarchy = true,
    public readonly hierarchy?: Hierarchy
  ){
    super((...args) => {
      let result = Thing.fromThingConstraint(contextStack.wrap(() => func(...(args as I))));
      if(overrideHierarchy)
        result = result.applyHierarchy(Hierarchy.create({
          braceType: "(",
          children: [
            this.hierarchy ?? Hierarchy.create({ name }),
            ...args.map(x => Hierarchy.from(x)),
          ],
          linkedProducts: result.hierarchy?.linkedProducts,
        })) as ThingFromConstraint<T>;
      return result;
    }, {}, name);
  }

  applyHierarchy(hierarchy: Hierarchy){
    return new Component(this.name, this.func, this.overrideHierarchy, hierarchy);
  }

  static isComponent(value: unknown){
    return ComponentConstraint.isComponentConstraint(value) && value instanceof Component;
  }

  static fromComponentConstraint<I extends any[], T extends ThingConstraint>(component: ComponentConstraint<I, T>){
    return new Component(component.name, component.func, component.overrideHierarchy, component.hierarchy);
  }

}
