
import { Mesh, Face, Vector3 } from "@escad/mesh";
// @ts-ignore
import CSG from "csg";
import {
  Work,
  Leaf,
  Element,
  Elementish,
  Product,
  Operation,
  Id,
  Component,
} from "@escad/core";

class CSGWrapper extends Product<CSGWrapper> {
  type = CSGWrapper;

  static id = new Id("CSGWrapper", __filename);

  constructor(public node: any) {
    super();
  }

  clone() {
    return new CSGWrapper(this.node);
  }

  serialize() {
    function serializePoly(poly: any) {
      let buf = Buffer.alloc(poly.vertices.length * 3 * 4 + 1);
      buf.writeUInt8(poly.vertices.length);
      poly.vertices.map((v: any, i: number) => {
        [v.pos.x, v.pos.y, v.pos.z].map((x, j) =>
          buf.writeFloatLE(x, (i * 3 + j) * 4 + 1)
        )
      })
      return buf;
    }

    function serializeNode(node: any) {
      if (node === null)
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

    return serializeNode(this.node);
  }

  static deserialize(buf: Buffer) {
    function deserializeNode(buf: Buffer) {
      if (buf.length === 0)
        return null;
      let l = buf.readUIntLE(0, 6);
      let fl = buf.readUIntLE(6 + l, 6);
      let bl = buf.readUIntLE(12 + l + fl, 6);
      if (!(l + fl + bl))
        return null;
      let polys = [];
      for (let i = 6; i < 6 + l;) {
        let pl = buf.readUInt8(i);
        i++;
        let I = i;
        let verts = [];
        for (; i < I + pl * 3 * 4; i += 3 * 4) {
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
      if (polys.length)
        node.plane = polys[0].plane.clone();
      return node;
    }

    return new CSGWrapper(deserializeNode(buf));
  }

}

class MeshToCsgWork extends Work<MeshToCsgWork, CSGWrapper, [Mesh]> {
  type = MeshToCsgWork;

  static id = new Id("MeshToCsgWork", __filename);

  constructor(child: Leaf<Mesh>) {
    super([child]);
    this.freeze();
  }

  clone([child]: [Leaf<Mesh>]) {
    return new MeshToCsgWork(child);
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize([child]: [Leaf<Mesh>]) {
    return new MeshToCsgWork(child);
  }

  async execute([input]: [Mesh]) {
    let polygons = input.faces.map(f => new CSG.Polygon(f.points.map(v => new CSG.Vertex(new CSG.Vector(v), []))));
    let node = new CSG.Node(polygons);
    return new CSGWrapper(node).finish();
  }

}

class CsgToMeshWork extends Work<CsgToMeshWork, Mesh, [CSGWrapper]> {
  type = CsgToMeshWork;

  static id = new Id("CsgToMeshWork", __filename);

  constructor(child: Leaf<CSGWrapper>) {
    super([child]);
    this.freeze();
  }

  clone([child]: [Leaf<CSGWrapper>]) {
    return new CsgToMeshWork(child);
  }

  serialize() {
    return Buffer.alloc(0);
  }

  static deserialize([child]: [Leaf<CSGWrapper>]) {
    return new CsgToMeshWork(child);
  }

  async execute([input]: [CSGWrapper]) {
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

class CsgWork extends Work<CsgWork, CSGWrapper, CSGWrapper[]> {
  type = CsgWork;

  static id = new Id("CsgWork", __filename);

  constructor(children: Leaf<CSGWrapper>[], public operations: CsgOperation[], public final: number) {
    super(children);
    this.freeze();
  }

  clone(children: Leaf<CSGWrapper>[]) {
    return new CsgWork(this.children, this.operations, this.final);
  }

  serialize() {
    return Buffer.from(JSON.stringify([this.operations, this.final]), "utf8");
  }

  static deserialize(children: Leaf<CSGWrapper>[], buffer: Buffer) {
    return new CsgWork(children, ...(JSON.parse(buffer.toString("utf8")) as [CsgOperation[], number]));
  }

  async execute(inputs: CSGWrapper[]) {
    let nodes = inputs.map(i => new CSG.Node(i.node.allPolygons()));
    this.operations.map(op => {
      if (op[0] === "invert")
        return nodes[op[1]].invert();
      if (op[0] === "clipTo")
        return nodes[op[1]].clipTo(nodes[op[2]]);
      if (op[0] === "build")
        return nodes[op[1]] = new CSG.Node(nodes[op[1]].allPolygons().concat(nodes[op[2]].allPolygons()));
    })
    return new CSGWrapper(nodes[this.final]).finish();
  }

}

Product.Registry.register(CSGWrapper);
Work.Registry.register(MeshToCsgWork);
Work.Registry.register(CsgToMeshWork);
Work.Registry.register(CsgWork);

let _csg = (args: Leaf<Mesh>[], ops: CsgOperation[], fin: number) =>
  new CsgToMeshWork(new CsgWork(args.map(a => new MeshToCsgWork(a)), ops, fin));
let _union = (...originalArgs: Elementish<Mesh>[]) => {
  let flatArgs = new Element(originalArgs).toArrayFlat();
  if (flatArgs.length === 0)
    return;
  if (flatArgs.length === 1)
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

let _diff = (el: Element<Mesh>) => {
  let originalArgs: Elementish<Mesh> = el.toArrayDeep();
  if (!(originalArgs instanceof Array))
    return originalArgs;
  if (originalArgs.length === 0)
    return;
  if (originalArgs.length === 1)
    [originalArgs] = originalArgs;
  const args = new Element(originalArgs).toArrayDeep();
  if (args instanceof Mesh || args instanceof Work)
    return args;
  const positive = _union(args[0]);
  const negative = _union(...args.slice(1));
  if (!positive || !negative)
    return positive;
  const a = 0, b = 1;
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

let _intersect = (...originalArgs: Elementish<Mesh>[]) => {
  let args = new Element(originalArgs).toArrayFlat();
  if (args.length === 0)
    return;
  if (args.length === 1)
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

export const union: Operation<Mesh, Mesh> = new Operation("union", el => _union(el) ?? new Mesh([]).finish());
export const diff: Operation<Mesh, Mesh> = new Operation("diff", el => _diff(el) ?? new Mesh([]).finish());
export const intersection: Operation<Mesh, Mesh> = new Operation("intersect", el => _intersect(el) ?? new Mesh([]).finish());

export const add: Component<Elementish<Mesh>[], Operation<Mesh, Mesh>> =
  new Component("add", (...el) => new Operation("add", el2 => union(el2, el)))
export const sub: Component<Elementish<Mesh>[], Operation<Mesh, Mesh>> =
  new Component("sub", (...el) => new Operation("sub", el2 => diff(el2, el)))
export const intersect: Component<Elementish<Mesh>[], Operation<Mesh, Mesh>> =
  new Component("intersect", (...el) => new Operation("intersect", el2 => intersection(el2, el)))

export { MeshToCsgWork, CsgToMeshWork, CSGWrapper, CsgWork, };