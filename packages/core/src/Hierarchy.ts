
import { hash, Sha } from "./hash";
import { Elementish, Element } from "./Element";
import Product from "./Product";
import Work from "./Work";
import fs from "fs-extra";
import path from "path";

type BraceType = "{" | "[" | "(" | ":" | "";

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

export interface FullHierarchyArgs extends HierarchyArgs {
  readonly name: string,
  readonly braceType: BraceType,
  readonly children: readonly Hierarchy[],
  readonly output: Hierarchy,
  readonly input: Hierarchy | null,
  readonly fullOutput: Hierarchy,
  readonly isOutput: boolean,
  readonly isFullOutput: boolean,
}

class Hierarchy implements FullHierarchyArgs {

  static dir: string = "";

  readonly name: string;
  readonly braceType: BraceType;
  readonly children: readonly Hierarchy[];
  readonly output: Hierarchy;
  readonly fullOutput: Hierarchy;
  readonly input: Hierarchy | null;
  readonly isOutput: boolean;
  readonly isFullOutput: boolean;

  readonly sha: Sha;

  readonly writePromise: Promise<void>;

  constructor({
    name = "",
    braceType = "",
    children = [],
    output,
    input = null,
    fullOutput,
    isOutput = false,
    isFullOutput = false,
  }: HierarchyArgs) {
    if (isOutput || isFullOutput)
      output = this;
    if (isFullOutput)
      fullOutput = this;
    if (!output)
      output = new Hierarchy({
        name,
        braceType,
        input,
        children: children.map(c => c.output),
        isOutput: true,
      })
    if (!fullOutput)
      fullOutput = output !== this ? output.fullOutput : new Hierarchy({
        name,
        braceType,
        input,
        children: children.map(c => c.fullOutput),
        isFullOutput: true,
      })

    if (braceType === "" && children.length)
      throw new Error("braceType \"\" must be used without children")

    if ((braceType === "{" || braceType === "[") && name !== "")
      throw new Error(`braceType "${braceType}" cannot be used with a name`);

    if (braceType === ":" && children.length !== 1)
      throw new Error("braceType \":\" must be used with exactly one child");

    this.name = name;
    this.braceType = braceType;
    this.children = children;
    this.output = output;
    this.fullOutput = fullOutput;
    this.input = input;
    this.isOutput = isOutput;
    this.isFullOutput = isFullOutput;

    let obj = {
      name,
      braceType,
      children: children.map(c => c.sha.b64),
      output: output === this ? null : output.sha.b64,
      fullOutput: fullOutput === this ? null : fullOutput.sha.b64,
      input: input?.sha.b64 ?? null,
    };

    this.sha = hash.json(obj);
    this.writePromise = fs.writeFile(path.join(Hierarchy.dir, this.sha.b64), JSON.stringify(obj));

    Object.freeze(this);
  }

  static fromElementish(el: Elementish<Product>): Hierarchy {
    if (typeof el !== "object" && typeof el !== "function")
      throw new Error("Invalid input to Hierarchy.fromElementish");
    if (el instanceof Hierarchy)
      return el;
    if (el instanceof Element)
      return el.hierarchy;
    if (el instanceof Product || el instanceof Work)
      return new Hierarchy({
        name: `<${el.type.id.name}>`,
      })
    if (el instanceof Array)
      return new Hierarchy({
        braceType: "[",
        children: el.map(e => Hierarchy.fromElementish(e)),
      });
    return new Hierarchy({
      braceType: "{",
      children: Object.entries(el).map(([k, v]) =>
        new Hierarchy({
          name: k,
          braceType: ":",
          children: [Hierarchy.fromElementish(v)]
        })
      )
    });
  }

  apply<T extends Product>(el: Elementish<T>) {
    return new Element(el, this);
  }

  clone() {
    return new Hierarchy(this);
  }

}

export default Hierarchy;
