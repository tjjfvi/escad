
const { Work, Product, operators, chainables, Component } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");

class CSG extends Product {

  static id = "CSG";

  construct(...as){
    if(!as.length) {
      this.front = null;
      this.back = null;
      this.faces = [];
      this.plane = null;
    } else {
      [this.front, this.back, this.faces = [], this.plane] = as;
      if(!this.plane && this.faces[0])
        this.plane = this.faces[0].plane;
    }
  }

  invert(){
    return new CSG(
      this.back && this.back.invert(),
      this.front && this.front.invert(),
      this.faces.map(p => p.flip()),
      this.plane && this.plane.flip(),
    );
  }

  clipFaces(faces){
    if(!this.plane) return faces;
    let front = [];
    let back = [];
    faces.map(f => this.plane.splitFace(f, front, back, front, back));
    if(this.front) front = this.front.clipFaces(front);
    console.log(!!this.back, back.length)
    if(this.back) back = this.back.clipFaces(back);
    else back = []; // Remove the polygons; they must be inside the mesh
    return front.concat(back);
  }

  clipTo(node){
    console.log("clipTo")
    return new CSG(
      this.front && this.front.clipTo(node),
      this.back && this.back.clipTo(node),
      node.clipFaces(this.faces),
      this.plane,
    );
  }

  allFaces(){
    let fs = [...this.faces];
    if(this.front) fs.push(...this.front.allFaces());
    if(this.back) fs.push(...this.back.allFaces());
    return fs;
  }

  build(faces){
    if(!faces.length) return this;
    let plane = this.plane || faces[0].plane;
    let front = [];
    let back = [];
    let fs = [...this.faces];
    faces.map(f => plane.splitFace(f, fs, fs, front, back));
    return new CSG(
      !front.length ? this.front : (this.front || new CSG()).build(front),
      !back.length ? this.back : (this.back || new CSG()).build(back),
      fs,
      plane,
    );
  }

  serialize(){
    let ps = this.faces.map(f => f.serialize());
    let l = ps.length * 12;
    let front = this.front ? this.front.serialize() : Buffer.alloc(0);
    let back = this.back ? this.back.serialize() : Buffer.alloc(0);
    let buf = Buffer.concat([
      Buffer.alloc(6),
      ...ps,
      Buffer.alloc(6),
      front,
      Buffer.alloc(6),
      back
    ], 18 + l + front.length + back.length);
    buf.writeUIntLE(ps.length, 0, 6);
    buf.writeUIntLE(front.length, 6 + l, 6);
    buf.writeUIntLE(l, 12 + l + front.length, 6);
    return buf;
  }

  static deserialize(buf){
    if(buf.length === 0)
      return null;
    let l = buf.readUIntLE(0) * 12;
    let fl = buf.readUIntLE(6 + l);
    let bl = buf.readUIntLE(12 + l + fl);
    let faces = [];
    for(let i = 6; i < 6 + l;) {
      let pl = buf.readUInt8(i);
      i++;
      let I = i;
      let verts = [];
      for(; i < I + pl; i += 6 * 4) {
        let ns = [0, 1, 2].map(x => buf.readFloatLe(i + 4 * x));
        let vert = new Vector3(...ns);
        verts.push(vert);
      }
      let face = new CSG.Polygon(verts);
      faces.push(face);
    }
    return new CSG(
      CSG.deserialize(buf.subarray(6 + l, 6 + l + fl)),
      CSG.deserialize(buf.subarray(12 + l + fl, 12 + l + fl + bl)),
      faces
    );
  }

}

class MeshToCsgWork extends Work {

  static id="MeshToCsgWork";

  execute([input]){
    return new CSG().build(input.faces);
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
    return new Mesh(input.allFaces());
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
    let nodes = [...inputs];
    this.args[0].map(arg => {
      if(arg[0] === "invert")
        return nodes[arg[1]] = nodes[arg[1]].invert();
      if(arg[0] === "clipTo")
        return nodes[arg[1]] = nodes[arg[1]].clipTo(nodes[arg[2]]);
      if(arg[0] === "build")
        return nodes[arg[1]] = nodes[arg[1]].build(nodes[arg[2]].allFaces());
    })
    console.log(this.args[0].length, nodes)
    return nodes[this.args[1]];
  }

}

Product.Registry.register(CSG);
Work.Registry.register(MeshToCsgWork);
Work.Registry.register(CsgToMeshWork);

let _csg = (args, ops, ret) =>
  new CsgToMeshWork([new CsgWork(args.map(a => new MeshToCsgWork([a])), ops, ret)])
let _union = (...args) => {
  args = args.flat(Infinity);
  if(args.length === 0)
    return;
  if(args.length === 1)
    return args[0];
  return _csg(args, args.slice(1).flatMap((_, i) => {
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

let _diff = (...args) => {
  if(args.length === 0)
    return;
  args = [_union(args[0]), _union(args.slice(1))];
  if(!args[1])
    return args[0];
  let a = 0;
  let b = 1;
  return _csg(args, [
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

let _intersect = (...args) => {
  args = args.flat(Infinity);
  if(args.length === 0)
    return;
  if(args.length === 1)
    return;
  if(!args[1])
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

module.exports = { MeshToCsgWork, CsgToMeshWork, CSG };
