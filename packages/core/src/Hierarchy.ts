
import { Product } from "./Product";
import { LeafProduct } from "./LeafProduct";
import { checkTypeProperty } from "./checkTypeProperty";
import { Component } from "./Component";
import { Element } from "./Element";
import { Hash } from "./Hash";
import { Operation } from "./Operation";

export type BraceType = "{" | "[" | "|" | "(" | ":" | "=" | "";

export interface Hierarchy {
  readonly type: "Hierarchy",
  readonly name: string,
  readonly braceType: BraceType,
  readonly children: readonly Hierarchy[],
  readonly linkedProducts: readonly Hash<Product>[],
}

export const Hierarchy = {
  create: ({
    name = "",
    braceType = "",
    children = [],
    linkedProducts = children.flatMap(c => c.linkedProducts),
  }: Partial<Hierarchy>): Hierarchy => {
    if(braceType === "" && children.length)
      throw new Error(`braceType "${braceType}" must be used without children`)

    if((braceType === "" || braceType === ":") && !name)
      throw new Error(`braceType "${braceType}" must be used with a name`)

    if((braceType !== "" && braceType !== ":") && name !== "")
      throw new Error(`braceType "${braceType}" cannot be used with a name`);

    if((braceType === "(" || braceType === "|") && !children.length)
      throw new Error(`braceType "${braceType}" must be used with at least one child`);

    if(braceType === ":" && children.length !== 1)
      throw new Error("braceType \":\" must be used with exactly one child");

    if(braceType === "=" && children.length !== 2)
      throw new Error(`braceType "=" must be used with exactly two children`);

    if(braceType === "=" && children[0].braceType === "=")
      throw new Error(`braceType "="'s first child must not have a braceType of "="`)

    return {
      type: "Hierarchy",
      name,
      braceType,
      children,
      linkedProducts,
    };
  },
  isHierarchy: checkTypeProperty.string<Hierarchy>("Hierarchy"),
  from: (val: unknown, raw = false): Hierarchy => {
    if(
      typeof val === "string" ||
      typeof val === "number" ||
      typeof val === "bigint" ||
      typeof val === "boolean" ||
      typeof val === "symbol" ||
      val === undefined ||
      val === null
    )
      return Hierarchy.create({ name: val ? val.toString() : val + "" })
    if(!raw) {
      if(Hierarchy.isHierarchy(val))
        return val;
      if(Element.isElement(val))
        return val.hierarchy ?? Hierarchy.from(val.value);
      if(Component.isComponent(val) || Operation.isOperation(val))
        return val.hierarchy ?? Hierarchy.create({ name: val.name });
      if(LeafProduct.isLeafProduct(val))
        return Hierarchy.create({
          name: `<${val.type.full}>`,
          linkedProducts: [Hash.create(val)],
        });
      if(Product.isProduct(val))
        return Hierarchy.create({
          name: `<${val.type}>`,
          linkedProducts: [Hash.create(val)],
        });
    }
    if(val instanceof Array)
      return Hierarchy.create({
        braceType: "[",
        children: val.map(e => Hierarchy.from(e, raw)),
      });
    return Hierarchy.create({
      braceType: "{",
      children: Object.entries(val as any).map(([k, v]) =>
        Hierarchy.create({
          name: k,
          braceType: ":",
          children: [Hierarchy.from(v, raw)]
        })
      )
    });
  },
};

