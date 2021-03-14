
import { CallHierarchy } from "./CallHierarchy"
import { checkTypeProperty } from "./checkTypeProperty"
import { contextStack } from "./ContextStack"
import { ExtensibleFunction } from "./ExtensibleFunction"
import { Hierarchy, HierarchyProp } from "./Hierarchy"
import { Hkt } from "./Hkt"
import { NameHierarchy } from "./NameHierarchy"
import { Thing, StripRealm } from "./Thing"

export interface Component<I extends any[], O extends Thing> {
  readonly type: "Component",
  readonly func: (...input: I) => O,
  readonly name: string,
  readonly hierarchy?: HierarchyProp,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
  (...args: I): StripRealm<O>,
}

export interface ComponentOpts {
  readonly hierarchy?: HierarchyProp,
  readonly overrideHierarchy?: boolean,
  readonly showOutputInHierarchy?: boolean,
}

export const Component = {
  isComponent: checkTypeProperty.string<Component<any, any>>("Component"),
  create: <I extends any[], O extends Thing>(
    name: string,
    func: (...args: I) => O,
    { hierarchy, overrideHierarchy = true, showOutputInHierarchy = true }: ComponentOpts = {},
  ): Component<I, O> => {
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
    ) as Component<I, O>
    return that

    async function createHierarchy(result: O, args: I){
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
  applyHierarchy: <I extends any[], O extends Thing>(
    component: Component<I, O>,
    hierarchy?: HierarchyProp,
  ) =>
    Component.create(component.name, component.func, {
      ...component,
      hierarchy,
    }),
}

export type GenericComponent<T, I extends Hkt<T, any[]>, O extends Hkt<T, Thing>> =
  & Omit<Component<Hkt.Output<I, T>, Hkt.Output<O, T>>, "func">
  & {
    readonly func: <U extends T>(...args: Hkt.Output<I, U>) => Hkt.Output<O, U>,
    <U extends T>(...args: Hkt.Output<I, U>): StripRealm<Hkt.Output<O, U>>,
    readonly __generic: true,
  }

export const GenericComponent = {
  create: <T, I extends Hkt<T, any[]>, O extends Hkt<T, Thing>>(
    name: string,
    func: <U extends T>(...args: Hkt.Output<I, U>) => Hkt.Output<O, U>,
    opts?: ComponentOpts,
  ): GenericComponent<T, I, O> =>
    Component.create<Hkt.Output<I, T>, Hkt.Output<O, T>>(name, func, opts) as never,
  applyHierarchy: <T, I extends Hkt<T, any[]>, O extends Hkt<T, Thing>>(
    Component: GenericComponent<T, I, O>,
    hierarchy?: Hierarchy,
  ) =>
    GenericComponent.create<T, I, O>(Component.name, Component.func, { ...Component, hierarchy }),
}
