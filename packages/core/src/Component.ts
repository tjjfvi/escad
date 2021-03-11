
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
  readonly showOutputInHierarchy?: boolean,
  (...args: I): StripRealm<T>,
}

export interface ComponentOpts {
  readonly hierarchy?: Hierarchy,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
}

export const Component = {
  isComponent: checkTypeProperty.string<Component<any, any>>("Component"),
  create: <I extends any[], T extends Thing>(
    name: string,
    func: (...args: I) => T,
    { hierarchy, overrideHierarchy = true, showOutputInHierarchy = true }: ComponentOpts = {},
  ): Component<I, T> => {
    const that = Object.assign(
      new ExtensibleFunction(
        (...args: I) => {
          const result = contextStack.wrap(() => func(...args));
          const origHierarchy = result.hierarchy;
          let resultHierarchy = origHierarchy;
          if(overrideHierarchy)
            resultHierarchy = Hierarchy.create({
              braceType: "(",
              children: [
                hierarchy ?? Hierarchy.create({ name }),
                ...args.map(x => Hierarchy.from(x)),
              ],
              linkedProducts: Hierarchy.from(result).linkedProducts,
            });
          if(overrideHierarchy && resultHierarchy && origHierarchy && showOutputInHierarchy)
            resultHierarchy = Hierarchy.create({
              braceType: "=",
              children: [
                resultHierarchy,
                origHierarchy,
              ],
              linkedProducts: origHierarchy.linkedProducts,
            })
          return Thing.applyHierarchy(result, resultHierarchy);
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
  applyHierarchy: <I extends any[], T extends Thing>(component: Component<I, T>, hierarchy?: Hierarchy) =>
    Component.create(component.name, component.func, {
      ...component,
      hierarchy,
    })
}
