
import { CallHierarchy } from "./CallHierarchy";
import { checkTypeProperty } from "./checkTypeProperty";
import { contextStack } from "./ContextStack";
import { ExtensibleFunction } from "./ExtensibleFunction";
import { Hierarchy } from "./Hierarchy";
import { NameHierarchy } from "./NameHierarchy";
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
          const resultHierarchy = result.hierarchy;
          let outputHierarchy = resultHierarchy;
          if(overrideHierarchy)
            outputHierarchy = CallHierarchy.create({
              operator: hierarchy ?? NameHierarchy.create({ name }),
              operands: args.map(x => Hierarchy.from(x)),
              result: resultHierarchy && showOutputInHierarchy ? resultHierarchy : undefined,
              composable: false,
              linkedProducts: Hierarchy.from(result).linkedProducts,
            });
          return Thing.applyHierarchy(result, outputHierarchy);
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
