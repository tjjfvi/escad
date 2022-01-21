
import { Product } from "./Product.ts"
import { Component } from "./Component.ts"
import { Element } from "./Element.ts"
import { Hash } from "./Hash.ts"
import { Operation } from "./Operation.ts"
import { ArrayHierarchy } from "./ArrayHierarchy.ts"
import { CallHierarchy } from "./CallHierarchy.ts"
import { ObjectHierarchy } from "./ObjectHierarchy.ts"
import { NameHierarchy } from "./NameHierarchy.ts"
import { ValueHierarchy } from "./ValueHierarchy.ts"
import { Promisish } from "./Promisish.ts"
import { HashProduct } from "./HashProduct.ts"
import { artifactManager } from "./ArtifactManager.ts"

export type HierarchyProp = Promisish<Hierarchy | undefined>

export interface _Hierarchy {
  readonly type: `${string}Hierarchy`,
  readonly linkedProducts?: readonly Hash<Product>[],
}

export type Hierarchy =
  | ObjectHierarchy
  | ArrayHierarchy
  | CallHierarchy
  | NameHierarchy
  | ValueHierarchy

export const Hierarchy = {
  isHierarchy: (value: unknown): value is Hierarchy =>
    ObjectHierarchy.isObjectHierarchy(value)
    || ArrayHierarchy.isArrayHierarchy(value)
    || CallHierarchy.isCallHierarchy(value)
    || NameHierarchy.isNameHierarchy(value)
    || ValueHierarchy.isValueHierarchy(value),
  from: async (value: unknown, raw = false): Promise<Hierarchy> => {
    value = await value
    if(
      typeof value === "string"
      || typeof value === "number"
      || typeof value === "boolean"
      || typeof value === "symbol"
      || value === undefined
      || value === null
    )
      return ValueHierarchy.from(value)
    if(!raw) {
      if(Hierarchy.isHierarchy(value))
        return value
      if(Element.isElement(value))
        return await value.hierarchy ?? Hierarchy.from(value.value)
      if(Component.isComponent(value) || Operation.isOperation(value))
        return await value.hierarchy ?? NameHierarchy.create({ name: value.name })
      if(Product.isProduct(value)) {
        let product = HashProduct.fromProduct(value)
        let hash = await artifactManager.storeRaw(product)
        return NameHierarchy.create({
          name: `<${value.type}>`,
          linkedProducts: [hash],
        })
      }
    }
    if(value instanceof Array)
      return ArrayHierarchy.from(value, raw)
    return ObjectHierarchy.from(value as Record<string, unknown>, raw)
  },
  flattenLinkedProducts: (hierarchies: Hierarchy[]) =>
    hierarchies.flatMap(h => h.linkedProducts ?? []),
}

