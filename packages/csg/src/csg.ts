
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
  constLengthBuffer,
  SerializeResult,
  DeserializeResult,
  buffer,
  Serializer,
  SerializeFunc,
  DeserializeFunc,
  concat,
  string,
  uint16LE,
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

  serialize(): SerializeResult{
    function serializePoly(poly: any){
      let buf = Buffer.alloc(poly.vertices.length * 3 * 4 + 1);
      buf.writeUInt8(poly.vertices.length);
      poly.vertices.map((v: any, i: number) => {
        [v.pos.x, v.pos.y, v.pos.z].map((x, j) =>
          buf.writeFloatLE(x, (i * 3 + j) * 4 + 1)
        )
      })
      return buf;
    }

    function serializeNode(node: any){
      if(node === null)
        return Buffer.alloc(0);
      let ps = node.polygons.map(serializePoly)
      let l = ps.map((x: any) => x.length).reduce((a: number, b: number) => a + b, 0);
      let front = serializeNode(node.front);
      let back = serializeNode(node.back);
      let buf = Buffer.concat([
        Buffer.alloc(6),
        ...ps,
        Buffer.alloc(6),
        front,
        Buffer.alloc(6),
        back
      ], 18 + l + front.length + back.length);
      buf.writeUIntLE(l, 0, 6);
      buf.writeUIntLE(front.length, 6 + l, 6);
      buf.writeUIntLE(back.length, 12 + l + front.length, 6);
      return buf;
    }

    let buffer = serializeNode(this.node);

    return constLengthBuffer(buffer.length).serialize(buffer);
  }

  static deserialize(buf: Buffer): DeserializeResult<FinishedProduct<CSGWrapper>>{
    function deserializeNode(buf: Buffer){
      if(buf.length === 0)
        return null;
      let l = buf.readUIntLE(0, 6);
      let fl = buf.readUIntLE(6 + l, 6);
      let bl = buf.readUIntLE(12 + l + fl, 6);
      if(!(l + fl + bl))
        return null;
      let polys = [];
      for(let i = 6; i < 6 + l;) {
        let pl = buf.readUInt8(i);
        i++;
        let I = i;
        let verts = [];
        for(; i < I + pl * 3 * 4; i += 3 * 4) {
          let ns = [0, 1, 2].map(x => buf.readFloatLE(i + 4 * x));
          let vert = new CSG.Vertex(ns.slice(0, 3), [0, 0, 0]);
          verts.push(vert);
        }
        let poly = new CSG.Polygon(verts);
        polys.push(poly);
      }
      let node = new CSG.Node();
      node.front = deserializeNode(buf.subarray(12 + l, 12 + l + fl))
      node.back = deserializeNode(buf.subarray(18 + l + fl, 18 + l + fl + bl))
      node.polygons = polys;
      if(polys.length)
        node.plane = polys[0].plane.clone();
      return node;
    }

    let value = new CSGWrapper(deserializeNode(buf)).finish();

    return { length: buffer.length, value };
  }

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
