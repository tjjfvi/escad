
import { CallHierarchy } from "./CallHierarchy"
import { checkTypeProperty } from "./checkTypeProperty"
import { contextStack } from "./ContextStack"
import { ExtensibleFunction } from "./ExtensibleFunction"
import { Hierarchy } from "./Hierarchy"
import { NameHierarchy } from "./NameHierarchy"
import { Promisish } from "./Promisish"
import { Thing, StripRealm } from "./Thing"

export interface Component<I extends any[], T extends Thing> {
  readonly type: "Component",
  readonly func: (...input: I) => T,
  readonly name: string,
  readonly hierarchy?: Promisish<Hierarchy | undefined>,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
  (...args: I): StripRealm<T>,
}

export interface ComponentOpts {
  readonly hierarchy?: Promisish<Hierarchy | undefined>,
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
          const result = contextStack.wrap(() => func(...args))
          return Thing.applyHierarchy(result, createHierarchy(result, args))
        },
        {},
        name,
      ),
      {
        type: "Component" as const,
        func,
        overrideHierarchy,
        hierarchy,
      },
    ) as Component<I, T>

    return that

    async function createHierarchy(result: T, args: I){
      if(!overrideHierarchy)
        return result.hierarchy
      return CallHierarchy.create({
        operator: await hierarchy ?? NameHierarchy.create({ name }),
        operands: await Promise.all(args.map(x => Hierarchy.from(x))),
        result: showOutputInHierarchy ? await result.hierarchy : undefined,
        composable: false,
        linkedProducts: (await Hierarchy.from(result)).linkedProducts,
      })
    }
  },
  applyHierarchy: <I extends any[], T extends Thing>(
    component: Component<I, T>,
    hierarchy?: Promisish<Hierarchy | undefined>,
  ) =>
    Component.create(component.name, component.func, {
      ...component,
      hierarchy,
    }),
}
