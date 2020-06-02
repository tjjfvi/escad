
import { hash, Sha } from "./hash";
import { Elementish, Element } from "./Element";
import { Product } from "./Product";
import { Work } from "./Work";
import fs from "fs-extra";
import path from "path";
import { HierarchyManager } from "./HierarchyManager";
import { ProductManager } from "./ProductManager";

type BraceType = "{" | "[" | "(" | ":" | "";
const isBraceType = (x: string): x is BraceType => ["{", "[", "(", ":", ""].includes(x);

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

export class Hierarchy implements FullHierarchyArgs {

  static Manager = new HierarchyManager();

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


    const serialized = this.serialize();

    this.sha = hash(serialized);
    if (this.sha.b64.startsWith("BAS"))
      console.log(this.sha, "!!!");
    this.writePromise = Hierarchy.Manager.store(this.sha, Promise.resolve(this)).then(() => { });
  }

  serialize() {
    const buffer = Buffer.alloc(4 + this.name.length + 1 + 1 + 4 + (this.children.length + 3) * 32);
    buffer.writeUInt32LE(this.name.length);
    buffer.fill(this.name, 4);
    buffer.fill(this.braceType || 0, 4 + this.name.length);
    buffer.fill((
      (+(this.output === this) << 0) +
      (+(this.fullOutput === this) << 1) +
      (+(!this.input) << 2)
    ), this.name.length + 4 + 1);
    buffer.writeUInt32LE(this.children.length, this.name.length + 4 + 1 + 1);
    [...this.children, this.output, this.fullOutput, this.input].forEach((h, i) => {
      buffer.fill((h !== this && h) ? h.sha.buffer : 0, 4 + this.name.length + 1 + 1 + 4 + 32 * i);
    })
    return buffer;
  }

  static async deserialize(buffer: Buffer) {
    const nameLength = buffer.readUInt32LE(0);
    const name = buffer.slice(4, 4 + nameLength).toString("utf8");
    buffer = buffer.slice(4 + nameLength);

    const braceTypeStr = buffer.slice(0, 1).toString("utf8");
    const braceType = isBraceType(braceTypeStr) ? braceTypeStr : "";
    buffer = buffer.slice(1);

    const flags = buffer[0];
    const isOutput = !!(flags & (1 << 0));
    const isFullOutput = !!(flags & (1 << 1));
    const noInput = !!(flags & (1 << 2));
    buffer = buffer.slice(1);

    const childrenLength = buffer.readUInt32LE(0);
    buffer = buffer.slice(4);

    const children: Hierarchy[] = [];
    for (let i = 0; i < childrenLength; i++) {
      let sha = new Sha(buffer.slice(i * 32, (i + 1) * 32));
      let child = await Hierarchy.Manager.lookup(sha);
      if (!child)
        throw new Error(`Could not find Hierarchy ${sha.b64} referenced in serialized Hierarchy`);
      children.push(child);
    }
    buffer = buffer.slice(childrenLength * 32);

    const [output, fullOutput, input] = await Promise.all(
      [isOutput, isFullOutput, noInput].map(async (flag, i) =>
        flag ? null : await Hierarchy.Manager.lookup(new Sha(buffer.slice(i * 32, (i + 1) * 32)))
      )
    );

    return new Hierarchy({
      name,
      braceType,
      children,
      isOutput,
      isFullOutput,
      output,
      fullOutput,
      input,
    });
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

  apply<T extends Product<T>>(el: Elementish<T>) {
    return new Element(el, this);
  }

  clone() {
    return new Hierarchy(this);
  }

}
