
import { hash, Sha } from "./hash";
import { Elementish, Element } from "./Element";
import Product from "./Product";
import Work from "./Work";
import fs from "fs-extra";
import path from "path";

type BraceType = "{" | "[" | "(" | ":" | "";

class Hierarchy {

  static dir: string = "";

  name: string;
  braceType: BraceType;
  children: readonly Hierarchy[];
  output: Hierarchy;
  fullOutput: Hierarchy;
  input: Hierarchy | null;
  sha: Sha;

  writePromise: Promise<void>;

  constructor({
    name = "",
    braceType = "",
    children = [],
    output,
    input = null,
    fullOutput,
    isOutput,
    isFullOutput,
  }: {
    name?: string,
    braceType?: BraceType,
    children?: readonly Hierarchy[],
    output?: Hierarchy | null,
    input?: Hierarchy | null,
    fullOutput?: Hierarchy | null,
    isOutput?: boolean,
    isFullOutput?: boolean,
  }) {
    if (!output)
      output = isOutput || isFullOutput ? this : new Hierarchy({
        name,
        braceType,
        input,
        children: children.map(c => c.output),
        isOutput: true,
      })
    if (!fullOutput)
      fullOutput = output !== this ? output.fullOutput : isFullOutput ? this : new Hierarchy({
        name,
        braceType,
        input,
        children: children.map(c => c.fullOutput),
        isFullOutput: true,
      })

    this.name = name;
    this.braceType = braceType;
    this.children = children;
    this.output = output;
    this.fullOutput = fullOutput;
    this.input = input;
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
    if (el instanceof Element)
      return el.hierarchy;
    if (el instanceof Product)
      return new Hierarchy({
        name: `<${el.type.id.name}>`,
      })
    if (el instanceof Work)
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
