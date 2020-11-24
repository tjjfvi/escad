
import { Elementish, Element } from "./Element";
import { Product } from "./Product";
import { LeafProduct } from "./LeafProduct";
import { CompoundProduct } from "./CompoundProduct";
import { ArtifactManager } from "./ArtifactManager";
import { Id } from "./Id";

export type BraceType = "{" | "[" | "(" | ":" | "";
export const isBraceType = (x: string): x is BraceType => ["{", "[", "(", ":", ""].includes(x);

export interface HierarchyArgs {
  readonly name?: string,
  readonly braceType?: BraceType,
  readonly children?: readonly Hierarchy[],
  readonly output?: Hierarchy | null,
  readonly input?: Hierarchy | null,
  readonly fullOutput?: Hierarchy | null,
  readonly isOutput?: boolean,
  readonly isFullOutput?: boolean,
}

export interface Hierarchy extends HierarchyArgs {
  readonly isHierarchy: true,
  readonly name: string,
  readonly braceType: BraceType,
  readonly children: readonly Hierarchy[],
  readonly output: Hierarchy | null,
  readonly input: Hierarchy | null,
  readonly fullOutput: Hierarchy | null,
  readonly isOutput: boolean,
  readonly isFullOutput: boolean,
}

declare const hierarchyManagerIdSymbol: unique symbol;
const hierarchyManagerId = Id.create<typeof hierarchyManagerIdSymbol>("hierarchy", __filename, "0");

export const Hierarchy = {
  create: ({
    name = "",
    braceType = "",
    children = [],
    output = null,
    input = null,
    fullOutput = null,
    isOutput = false,
    isFullOutput = false,
  }: HierarchyArgs): Hierarchy => {
    if(isOutput || isFullOutput)
      output = null;
    if(isFullOutput)
      fullOutput = null;
    if(!output && !isOutput && !isFullOutput)
      output = Hierarchy.create({
        name,
        braceType,
        input,
        children: children.map(c => c.output ?? c),
        isOutput: true,
      })
    if(!fullOutput && !isFullOutput)
      fullOutput = output?.fullOutput ?? Hierarchy.create({
        name,
        braceType,
        input,
        children: children.map(c => c.fullOutput ?? c),
        isFullOutput: true,
      })

    if(braceType === "" && children.length)
      throw new Error("braceType \"\" must be used without children")

    if((braceType === "{" || braceType === "[") && name !== "")
      throw new Error(`braceType "${braceType}" cannot be used with a name`);

    if(braceType === ":" && children.length !== 1)
      throw new Error("braceType \":\" must be used with exactly one child");
    return {
      isHierarchy: true,
      name,
      braceType,
      children,
      fullOutput,
      input,
      isFullOutput,
      isOutput,
      output,
    };
  },
  Manager: new ArtifactManager(hierarchyManagerId),
  isHierarchy: (arg: any): arg is Hierarchy =>
    arg.isHierarchy === true,
  fromElementish: (el: Elementish<Product>): Hierarchy => {
    if(typeof el !== "object" && typeof el !== "function")
      throw new Error("Invalid input to Hierarchy.fromElementish");
    if(Hierarchy.isHierarchy(el))
      return el;
    if(el instanceof Element)
      return el.hierarchy;
    if(LeafProduct.isLeafProduct(el))
      return Hierarchy.create({
        name: `<${el.type.full}>`,
      });
    if(CompoundProduct.isCompoundProduct(el))
      return Hierarchy.create({
        name: `<CompoundProduct>`,
      });
    if(el instanceof Array)
      return Hierarchy.create({
        braceType: "[",
        children: el.map(e => Hierarchy.fromElementish(e)),
      });
    return Hierarchy.create({
      braceType: "{",
      children: Object.entries(el).map(([k, v]) =>
        Hierarchy.create({
          name: k,
          braceType: ":",
          children: [Hierarchy.fromElementish(v)]
        })
      )
    });
  },
  apply: <T extends Product>(hierarchy: Hierarchy, el: Elementish<T>) => new Element(el, hierarchy),
};

