
import { createProductTypeUtils, Id, LeafProduct } from "@escad/core";
import { Face, Plane, Vector3 } from "@escad/mesh";

declare const bspIdSymbol: unique symbol;
const bspId = Id<typeof bspIdSymbol>("Bsp", __filename);

export interface Bsp extends LeafProduct {
  readonly type: typeof bspId,
  readonly front: Bsp | null,
  readonly back: Bsp | null,
  readonly faces: readonly Face[],
  readonly plane: Plane,
}

export const Bsp = Object.assign(
  (front: Bsp | null, back: Bsp | null, faces: readonly Face[], plane: Plane): Bsp => ({
    type: bspId,
    front,
    back,
    faces,
    plane,
  }),
  {
    ...createProductTypeUtils<Bsp, "Bsp">(bspId, "Bsp"),

    id: bspId,

    invert: (bsp: Bsp): Bsp =>
      Bsp(
        bsp.back && Bsp.invert(bsp.back),
        bsp.front && Bsp.invert(bsp.front),
        bsp.faces.map(Face.flip),
        Plane.flip(bsp.plane),
      ),


    clipFaces: (bsp: Bsp, faces: readonly Face[]): Face[] => {
      let front: Face[] = [];
      let back: Face[] = [];
      faces.map(f => Plane.splitFace(bsp.plane, f, front, back, front, back));
      console.log(faces.length, front.length, back.length, !!bsp.front, !!bsp.back)
      if(bsp.front && front.length) front = Bsp.clipFaces(bsp.front, front);
      if(bsp.back && back.length) back = Bsp.clipFaces(bsp.back, back);
      else back = []; // Remove the polygons; they must be inside the mesh
      return front.concat(back);
    },

    clipTo: (a: Bsp, b: Bsp): Bsp => Bsp(
      a.front && Bsp.clipTo(a.front, b),
      a.back && Bsp.clipTo(a.back, b),
      Bsp.clipFaces(b, a.faces),
      a.plane,
    ),

    allFaces: (bsp: Bsp | null): Face[] =>
      bsp ? bsp.faces.concat(Bsp.allFaces(bsp.front)).concat(Bsp.allFaces(bsp.back)) : [],

    null: () => Bsp(null, null, [], Plane(Vector3(0, 0, 1), 0)),

    build: (bsp: Bsp | null, allFaces: readonly Face[]): Bsp | null => {
      if(!allFaces.length) return bsp;
      const plane = bsp?.plane ?? allFaces[0].plane;
      const front: Face[] = [];
      const back: Face[] = [];
      const faces = bsp?.faces.slice() ?? [];
      allFaces.map(f => Plane.splitFace(plane, f, faces, faces, front, back));
      console.log(bsp, allFaces.length, front.length, back.length, faces.length - (bsp?.faces.length ?? 0), bsp?.faces.length);
      return Bsp(
        Bsp.build(bsp?.front ?? null, front),
        Bsp.build(bsp?.back ?? null, back),
        faces,
        plane,
      );
    },

    trim: (bsp: Bsp | null): Bsp | null => {
      if(!bsp) return bsp;

      const front = Bsp.trim(bsp.front);
      const back = Bsp.trim(bsp.back);
      if(bsp.faces.length || (front && back))
        return Bsp(front, back, bsp.faces, bsp.plane);
      return front ?? back ?? null;
    },
  }
)
