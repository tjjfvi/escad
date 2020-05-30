
import { Element, Component } from ".";
import { Mesh } from "./Mesh";
import { Vector3 } from "./Vector3";

type PolyhedronVerts = Vector3[];
type PolyhedronFaces = number[][];
type PolyhedronArgs =
  | [PolyhedronVerts, PolyhedronFaces]
  | [{
    verts: PolyhedronVerts,
    faces: PolyhedronFaces,
  }]

export const polyhedron: Component<PolyhedronArgs, Element<Mesh>> = new Component("polyhedron", (...args) =>
  new Element(
    args.length === 2 ?
      Mesh.fromVertsFaces(...args) :
      Mesh.fromVertsFaces(args[0].verts, args[0].faces)
  )
);

