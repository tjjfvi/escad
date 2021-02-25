
import { checkTypeProperty } from "./checkTypeProperty";
import { contextStack } from "./ContextStack";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { Hierarchy } from "./Hierarchy";
import { Thing, StripRealm } from "./Thing";

export interface Component<I extends any[], T extends Thing> {
  readonly type: "Component",
  readonly func: (...input: I) => T,
  readonly name: string,
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
  (...args: I): StripRealm<T>,
}

export const Component = {
  isComponent: checkTypeProperty<Component<any, any>>("Component"),
  create: <I extends any[], T extends Thing>(
    name: string,
    func: (...args: I) => T,
    overrideHierarchy = true,
    hierarchy?: Hierarchy
  ): Component<I, T> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: I) => {
          let result = Thing.stripRealm(contextStack.wrap(() => func(...args)));
          if(overrideHierarchy)
            result = Thing.applyHierarchy(result, Hierarchy.create({
              braceType: "(",
              children: [
                that.hierarchy ?? Hierarchy.create({ name }),
                ...args.map(x => Hierarchy.from(x)),
              ],
              linkedProducts: result.hierarchy?.linkedProducts,
            }));
          return result;
        },
        {},
        name,
      ),
      {
        type: "Component" as const,
        func,
        overrideHierarchy,
        hierarchy,
      }
    ) as Component<I, T>;
    return that
  },
  applyHierarchy: <I extends any[], T extends Thing>(component: Component<I, T>, hierarchy: Hierarchy) =>
    Component.create(component.name, component.func, component.overrideHierarchy, hierarchy)
}
