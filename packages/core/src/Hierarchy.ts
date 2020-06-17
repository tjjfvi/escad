
import { hash, Sha } from "./hash";
import { Elementish, Element } from "./Element";
import { Product } from "./Product";
import { Work } from "./Work";
import { HierarchyManager } from "./HierarchyManager";
import { concat, string, constLengthString, optionalBank, array, Serializer } from "tszer";

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
  readonly output: Hierarchy | null,
  readonly input: Hierarchy | null,
  readonly fullOutput: Hierarchy | null,
  readonly isOutput: boolean,
  readonly isFullOutput: boolean,
}

export class Hierarchy implements FullHierarchyArgs {

  static Manager = new HierarchyManager();

  readonly name: string;
  readonly braceType: BraceType;
  readonly children: readonly Hierarchy[];
  readonly output: Hierarchy | null;
  readonly fullOutput: Hierarchy | null;
  readonly input: Hierarchy | null;
  readonly isOutput: boolean;
  readonly isFullOutput: boolean;

  readonly sha: Promise<Sha>;

  readonly writePromise: Promise<void>;

  constructor({
    name = "",
    braceType = "",
    children = [],
    output = null,
    input = null,
    fullOutput = null,
    isOutput = false,
    isFullOutput = false,
  }: HierarchyArgs){
    if(isOutput || isFullOutput)
      output = null;
    if(isFullOutput)
      fullOutput = null;
    if(!output && !isOutput && !isFullOutput)
      output = new Hierarchy({
        name,
        braceType,
        input,
        children: children.map(c => c.output ?? c),
        isOutput: true,
      })
    if(!fullOutput && !isFullOutput)
      fullOutput = output?.fullOutput ?? new Hierarchy({
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

    this.name = name;
    this.braceType = braceType;
    this.children = children;
    this.output = output;
    this.fullOutput = fullOutput;
    this.input = input;
    this.isOutput = isOutput;
    this.isFullOutput = isFullOutput;

    const serialized = Serializer.serialize(Hierarchy.serializer(), this);

    this.sha = hash(serialized);
    this.writePromise = this.sha.then(sha => Hierarchy.Manager.store(sha, Promise.resolve(this)).then(() => { }));
  }

  static hierarchySha = () => Sha.reference().map<Hierarchy>({
    serialize: h => h.sha,
    deserialize: async sha => await Hierarchy.Manager.lookup(sha) ?? (() => {
      throw new Error(`Could not find Hierarchy ${sha.hex} referenced in serialized Hierarchy`)
    })(),
  })

  static serializer = () => concat(
    string(),
    constLengthString(1),
    optionalBank(
      Hierarchy.hierarchySha(),
      Hierarchy.hierarchySha(),
      Hierarchy.hierarchySha(),
    ),
    array(Hierarchy.hierarchySha()),
  ).map<Hierarchy>({
    serialize: h => [
      h.name,
      h.braceType || " ",
      [h.output ?? void 0, h.fullOutput ?? void 0, h.input ?? void 0],
      h.children.slice()
    ],
    deserialize: ([name, bt, [o, fo, i], cs]) => new Hierarchy({
      name,
      braceType: isBraceType(bt) ? bt : "",
      output: o,
      fullOutput: fo,
      input: i,
      isOutput: !fo,
      isFullOutput: !fo,
      children: cs,
    })
  })

  static fromElementish(el: Elementish<Product>): Hierarchy{
    if(typeof el !== "object" && typeof el !== "function")
      throw new Error("Invalid input to Hierarchy.fromElementish");
    if(el instanceof Hierarchy)
      return el;
    if(el instanceof Element)
      return el.hierarchy;
    if(el instanceof Product || el instanceof Work)
      return new Hierarchy({
        name: `<${el.type.id.name}>`,
      })
    if(el instanceof Array)
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

  apply<T extends Product<T>>(el: Elementish<T>){
    return new Element(el, this);
  }

  clone(){
    return new Hierarchy(this);
  }

}
