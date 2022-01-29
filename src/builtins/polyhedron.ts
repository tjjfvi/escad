import { Mesh } from "./Mesh.ts";
import { Vector3 } from "./Vector3.ts";
import { Component, Element } from "../core/mod.ts";

type PolyhedronVerts = Vector3[];
type PolyhedronFaces = number[][];
type PolyhedronArgs =
  | [PolyhedronVerts, PolyhedronFaces]
  | [{
    verts: PolyhedronVerts;
    faces: PolyhedronFaces;
  }];

export const polyhedron: Component<PolyhedronArgs, Element<Mesh>> = Component
  .create("polyhedron", (...args) =>
    Element.create(
      args.length === 2
        ? Mesh.fromVertsFaces(...args)
        : Mesh.fromVertsFaces(args[0].verts, args[0].faces),
    ), { showOutput: false });
