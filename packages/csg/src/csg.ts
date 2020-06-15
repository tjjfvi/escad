
import { Mesh, Face, Vector3 } from "@escad/mesh";
// @ts-ignore
import CSG from "csg";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  Conversion,
  Work,
  Leaf,
  Element,
  Elementish,
  Product,
  Operation,
  Id,
  Component,
  ConvertibleTo,
  FinishedProduct,
  StrictLeaf,
} from "@escad/core";
import {
  Serializer,
  SerializeFunc,
  DeserializeFunc,
  concat,
  string,
  uint16LE,
  array,
  floatLE,
  optionalBank,
} from "tszer";

export class CSGWrapper extends Product<CSGWrapper> {

  type = CSGWrapper;

  static id = new Id("CSGWrapper", __filename);

  constructor(public node: any){
    super();
  }

  clone(){
    return new CSGWrapper(this.node);
  }

  static polySerializer = () =>
    array(concat(floatLE(), floatLE(), floatLE()).map<any>({
      serialize: v => [v.pos.x, v.pos.y, v.pos.z],
      deserialize: vs => new CSG.Vertex(vs, [0, 0, 0]),
    })).map<any>({
      serialize: p => p.vertices,
      deserialize: vs => new CSG.Polygon(vs),
    })

  static nodeSerializer = (): Serializer<any> =>
    optionalBank(concat(
      array(CSGWrapper.polySerializer()),
      CSGWrapper.nodeSerializer,
      CSGWrapper.nodeSerializer,
    )).map<any>({
      serialize: n => [n ? [n.polygons, n.front, n.back] : undefined],
      deserialize: ([v]) => {
        if(!v) return null
        let node = new CSG.Node();
        [node.polygons, node.front, node.back] = v;
        if(node.polygons.length)
          node.plane = node.polygons[0].plane.clone();
        return node;
      }
    })

  static serializer = () =>
    CSGWrapper.nodeSerializer().map<CSGWrapper>({
      serialize: cw => cw.node,
      deserialize: node => new CSGWrapper(node),
    })

  serialize = CSGWrapper.serializer().serialize;

  static deserialize = CSGWrapper.serializer().deserialize;

}

class MeshToCsgWork extends Work<MeshToCsgWork, CSGWrapper, [Mesh]> {

  type = MeshToCsgWork;

  static id = new Id("MeshToCsgWork", __filename);

  constructor(child: StrictLeaf<Mesh>){
    super([child]);
    this.freeze();
  }

  clone([child]: [StrictLeaf<Mesh>]){
    return new MeshToCsgWork(child);
  }

  static serializer: () => Serializer<MeshToCsgWork> = () =>
    Work.childrenReference<[Mesh]>().map<MeshToCsgWork>({
      serialize: flipWork => flipWork.children,
      deserialize: ([child]) => new MeshToCsgWork(child),
    })

  serialize: SerializeFunc<MeshToCsgWork> = MeshToCsgWork.serializer().serialize;

  static deserialize: DeserializeFunc<MeshToCsgWork> = MeshToCsgWork.serializer().deserialize;

  async execute([input]: [Mesh]){
    let polygons = input.faces.map(f => new CSG.Polygon(f.points.map(v => new CSG.Vertex(new CSG.Vector(v), []))));
    let node = new CSG.Node(polygons);
    return new CSGWrapper(node).finish();
  }

}

class CsgToMeshWork extends Work<CsgToMeshWork, Mesh, [CSGWrapper]> {

  type = CsgToMeshWork;

  static id = new Id("CsgToMeshWork", __filename);

  constructor(child: StrictLeaf<CSGWrapper>){
    super([child]);
    this.freeze();
  }

  clone([child]: [StrictLeaf<CSGWrapper>]){
    return new CsgToMeshWork(child);
  }

  static serializer: () => Serializer<CsgToMeshWork> = () =>
    Work.childrenReference<[CSGWrapper]>().map<CsgToMeshWork>({
      serialize: flipWork => flipWork.children,
      deserialize: ([child]) => new CsgToMeshWork(child),
    })

  serialize: SerializeFunc<CsgToMeshWork> = CsgToMeshWork.serializer().serialize;

  static deserialize: DeserializeFunc<CsgToMeshWork> = CsgToMeshWork.serializer().deserialize;

  async execute([input]: [CSGWrapper]){
    let faces: any[] = [];

    let tv = (v: any) => new Vector3(v.pos.x, v.pos.y, v.pos.z);
    input.node.allPolygons().map((p: any) => {
      faces.push(...p.vertices.slice(2).map((_: any, i: number) =>
        new Face([tv(p.vertices[0]), tv(p.vertices[i + 1]), tv(p.vertices[i + 2])])
      ));
    });

    return new Mesh(faces).finish();
  }

}

type CsgOperation =
  | readonly ["invert", number]
  | readonly ["clipTo", number, number]
  | readonly ["build", number, number]

class CsgWork extends Work<CsgWork, CSGWrapper, ConvertibleTo<CSGWrapper>[]> {

  type = CsgWork;

  static id = new Id("CsgWork", __filename);

  constructor(children: Leaf<CSGWrapper>[], public operations: CsgOperation[], public final: number){
    super(children);
    this.freeze();
  }

  clone(children: Leaf<CSGWrapper>[]){
    return new CsgWork(children, this.operations, this.final);
  }

  static serializer: () => Serializer<CsgWork> = () =>
    concat(
      Work.childrenReference<ConvertibleTo<CSGWrapper>[]>(),
      string(),
      uint16LE(),
    ).map<CsgWork>({
      serialize: work => [work.children, JSON.stringify(work.operations), work.final],
      deserialize: ([children, ops, final]) => new CsgWork(children, JSON.parse(ops), final),
    })

  serialize: SerializeFunc<CsgWork> = CsgWork.serializer().serialize;

  static deserialize: DeserializeFunc<CsgWork> = CsgWork.serializer().deserialize;

  async execute(rawInputs: FinishedProduct<ConvertibleTo<CSGWrapper>>[]){
    let inputs = await Promise.all(rawInputs.map(i => CSGWrapper.convert(i).process()));
    let nodes = await Promise.all(inputs.map(async i =>
      new CSG.Node(i.node.allPolygons())
    ));
    this.operations.map(op => {
      if(op[0] === "invert")
        return nodes[op[1]].invert();
      if(op[0] === "clipTo")
        return nodes[op[1]].clipTo(nodes[op[2]]);
      if(op[0] === "build")
        return nodes[op[1]] = new CSG.Node(nodes[op[1]].allPolygons().concat(nodes[op[2]].allPolygons()));
    })
    return new CSGWrapper(nodes[this.final]).finish();
  }

}

Product.Registry.register(CSGWrapper);
Work.Registry.register(CsgWork);

let _csg = (args: Leaf<CSGWrapper>[], ops: CsgOperation[], fin: number): StrictLeaf<CSGWrapper> =>
  new CsgWork(args, ops, fin);
let _union = (...originalArgs: Elementish<CSGWrapper>[]) => {
  let flatArgs = new Element(originalArgs).toArrayFlat();
  if(flatArgs.length === 0)
    return;
  if(flatArgs.length === 1)
    return flatArgs[0];
  return _csg(flatArgs, flatArgs.slice(1).flatMap((_, i) => {
    let a = 0;
    let b = i + 1;
    return [
      ["clipTo", a, b],
      ["clipTo", b, a],
      ["invert", b],
      ["clipTo", b, a],
      ["invert", b],
      ["build", a, b],
    ];
  }), 0);
}

let _diff = (el: Element<CSGWrapper>) => {
  let originalArgs: Elementish<CSGWrapper> = el.toArrayDeep();
  if(!(originalArgs instanceof Array))
    return originalArgs;
  if(originalArgs.length === 0)
    return;
  if(originalArgs.length === 1)
    [originalArgs] = originalArgs;
  const args = new Element(originalArgs).toArrayDeep();
  if(args instanceof Product || args instanceof Work)
    return args;
  const positive = _union(args[0]);
  const negative = _union(...args.slice(1));
  if(!positive || !negative)
    return positive;
  const a = 0,
    b = 1;
  return _csg([positive, negative], [
    ["invert", a],
    ["clipTo", a, b],
    ["clipTo", b, a],
    ["invert", b],
    ["clipTo", b, a],
    ["invert", b],
    ["build", a, b],
    ["invert", a],
  ], 0);
}

let _intersect = (...originalArgs: Elementish<CSGWrapper>[]) => {
  let args = new Element(originalArgs).toArrayFlat();
  if(args.length === 0)
    return;
  if(args.length === 1)
    return args[0];
  return _csg(args, [
    ["invert", 0],
    ...args.slice(1).flatMap((_, i) => {
      let a = 0;
      let b = i + 1;
      return [
        ["clipTo", b, a],
        ["invert", b],
        ["clipTo", a, b],
        ["clipTo", b, a],
        ["build", a, b],
      ] as const;
    }),
    ["invert", 0],
  ], 0);
}

export const union: Operation<CSGWrapper, CSGWrapper> = (
  new Operation<CSGWrapper, CSGWrapper>("union", el => _union(el) ?? new Element<CSGWrapper>([]))
);
export const diff: Operation<CSGWrapper, CSGWrapper>  = (
  new Operation<CSGWrapper, CSGWrapper>("diff", el => _diff(el) ?? new Element<CSGWrapper>([]))
);
export const intersection: Operation<CSGWrapper, CSGWrapper> = (
  new Operation<CSGWrapper, CSGWrapper>("intersect", el => _intersect(el) ?? new Element<CSGWrapper>([]))
)

export const add: Component<Elementish<CSGWrapper>[], Operation<CSGWrapper, CSGWrapper>> =
  new Component("add", (...el) => new Operation<CSGWrapper, CSGWrapper>("add", el2 => union(el2, el)))
export const sub: Component<Elementish<CSGWrapper>[], Operation<CSGWrapper, CSGWrapper>> =
  new Component("sub", (...el) => new Operation<CSGWrapper, CSGWrapper>("sub", el2 => diff(el2, el)))
export const intersect: Component<Elementish<CSGWrapper>[], Operation<CSGWrapper, CSGWrapper>> =
  new Component("intersect", (...el) =>
    new Operation<CSGWrapper, CSGWrapper>("intersect", el2 => intersection(el2, el))
  )


declare global {
  export namespace escad {
    interface ConversionsObj {
      meshToCsg: Conversion<Mesh, CSGWrapper>,
      csgToMesh: Conversion<CSGWrapper, Mesh>,
    }
  }
}

Product.ConversionRegistry.register(Mesh, CSGWrapper, mesh => new MeshToCsgWork(mesh));
Product.ConversionRegistry.register(CSGWrapper, Mesh, csg => new CsgToMeshWork(csg));
