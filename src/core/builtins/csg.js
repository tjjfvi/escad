
const { Work, Product, operators, chainables, Component, Hierarchy, arrayish } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");
const CSG = require("csg");

class CSGWrapper extends Product {

  static id = "CSGWrapper";

  construct(node){
    this.node = node;
  }

  serialize(){
    function serializePoly(poly){
      let buf = Buffer.alloc(poly.vertices.length * 3 * 4 + 1);
      buf.writeUInt8(poly.vertices.length);
      poly.vertices.map((v, i) => {
        [v.pos.x, v.pos.y, v.pos.z].map((x, j) =>
          buf.writeFloatLE(x, (i * 3 + j) * 4 + 1)
        )
      })
      return buf;
    }

    function serializeNode(node){
      if(node === null)
        return Buffer.alloc(0);
      let ps = node.polygons.map(serializePoly)
      let l = ps.map(x => x.length).reduce((a, b) => a + b, 0);
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

  static deserialize(buf){
    function deserializeNode(buf){
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

    return new CSGWrapper(deserializeNode(buf));
  }

}

class MeshToCsgWork extends Work {

  static id="MeshToCsgWork";

  execute([input]){
    let polygons = input.faces.map(f => new CSG.Polygon(f.points.map(v => new CSG.Vertex(new CSG.Vector(v), []))));
    let node = new CSG.Node(polygons);
    return new CSGWrapper(node);
  }

  transformChildren(children){
    children = super.transformChildren(children);
    let [child] = children;
    // if(child instanceof CsgToMeshWork)
    //  return this.returnVal = child.children[1];
    return [child];
  }

}

class CsgToMeshWork extends Work {

  static id="CsgToMeshWork";

  execute([input]){
    let faces = [];

    let tv = v => new Vector3(v.pos.x, v.pos.y, v.pos.z);
    input.node.allPolygons().map(p => {
      faces.push(...p.vertices.slice(2).map((_, i) =>
        new Face([tv(p.vertices[0]), tv(p.vertices[i + 1]), tv(p.vertices[i + 2])])
      ));
    });

    return new Mesh(faces);
  }

  transformChildren(children){
    children = super.transformChildren(children);
    let [child] = children;
    // if(child instanceof MeshToCsgWork)
    //  return this.returnVal = child.children[1];
    return [child];
  }

}

class CsgWork extends Work {

  static id = "CsgWork";

  execute(inputs){
    let nodes = inputs.map(i => new CSG.Node(i.node.allPolygons()));
    this.args[0].map(arg => {
      if(arg[0] === "invert")
        return nodes[arg[1]].invert();
      if(arg[0] === "clipTo")
        return nodes[arg[1]].clipTo(nodes[arg[2]]);
      if(arg[0] === "build")
        return nodes[arg[1]] = new CSG.Node(nodes[arg[1]].allPolygons().concat(nodes[arg[2]].allPolygons()));
    })
    return new CSGWrapper(nodes[this.args[1]]);
  }

}

Product.Registry.register(CSGWrapper);
Work.Registry.register(MeshToCsgWork);
Work.Registry.register(CsgToMeshWork);
Work.Registry.register(CsgWork);

let _csg = (args, h, ops, ret) =>
  new CsgToMeshWork([new CsgWork(args.map(a => new MeshToCsgWork([a], null)), null, ops, ret)], h)
let _union = (...oargs) => {
  let args = arrayish.toArrayDeep(oargs);
  if(args.length === 0)
    return;
  if(args.length === 1)
    return args[0];
  return _csg(args, new Hierarchy("union", oargs), args.slice(1).flatMap((_, i) => {
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

let _diff = (...oargs) => {
  if(oargs.length === 0)
    return;
  if(oargs.length === 1 && arrayish.isArrayish(oargs[0]))
    [oargs] = oargs;
  let args = arrayish.toArrayDeep(oargs, x => x, false)
  args = [_union(args[0]), _union(...args.slice(1))];
  if(!args[1])
    return args[0];
  let a = 0;
  let b = 1;
  return _csg(args, new Hierarchy("difference", oargs), [
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

let _intersect = (...oargs) => {
  let args = arrayish.toArrayDeep(oargs);
  if(args.length === 0)
    return;
  if(args.length === 1)
    return;
  if(!args[1])
    return args[0];
  return _csg(args, new Hierarchy("intersection", oargs), [
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
      ];
    }),
    ["invert", 0],
  ], 0);
}

operators.union = (...args) => new Component(_union(...args));
chainables.add = (comp, ...args) => comp(_union(comp(), ...args));

operators.diff = operators.difference = (...args) => new Component(_diff(...args));
chainables.sub = chainables.subtract = (comp, ...args) => comp(_diff(comp(), ...args));

operators.intersection = (...args) => new Component(_intersect(...args));
chainables.intersect = (comp, ...args) => comp(_intersect(comp(), ...args));

module.exports = { MeshToCsgWork, CsgToMeshWork, CSGWrapper, CsgWork, _csg, _union, _diff, _intersect };
