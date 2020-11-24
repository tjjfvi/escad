
import { Mesh, Vector3 } from "@escad/mesh";
import {
  Component,
  Element,
  Id,
  Conversion,
  Product,
  createProductTypeUtils,
  LeafElement,
  LeafProduct,
} from "@escad/core";

declare const cubeIdSymbol: unique symbol;
const cubeId = Id.create<typeof cubeIdSymbol>("Cube", __filename);

export interface Cube extends LeafProduct {
  readonly type: typeof cubeId,
  readonly center: Vector3,
  readonly size: Vector3,
}

export const Cube = {
  create: (center: Vector3, size: Vector3) => ({
    type: cubeId,
    center,
    size,
  }),
  ...createProductTypeUtils(cubeId, "Cube"),
  id: cubeId,
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/solids/cube": {
        cubeToMesh: Conversion<Cube, Mesh>,
      },
    }
  }
}

Product.ConversionRegistry.register({
  fromType: Cube.id,
  toType: Mesh.id,
  convert: async (cube: Cube): Promise<Mesh> => {
    const { center, size } = cube;

    const nx = center.x - size.x / 2;
    const ny = center.y - size.y / 2;
    const nz = center.z - size.z / 2;

    const px = center.x + size.x / 2;
    const py = center.y + size.y / 2;
    const pz = center.z + size.z / 2;

    const points = [
      Vector3.create(px, py, pz),
      Vector3.create(nx, py, pz),
      Vector3.create(px, ny, pz),
      Vector3.create(nx, ny, pz),
      Vector3.create(px, py, nz),
      Vector3.create(nx, py, nz),
      Vector3.create(px, ny, nz),
      Vector3.create(nx, ny, nz),
    ];

    return Mesh.fromVertsFaces(points, [
      [0, 1, 2],
      [3, 2, 1],
      [6, 5, 4],
      [5, 6, 7],
      [4, 1, 0],
      [5, 1, 4],
      [6, 2, 3],
      [6, 3, 7],
      [1, 7, 3],
      [5, 7, 1],
      [4, 0, 2],
      [6, 4, 2],
    ]);
  },
})

type TripletObj<T> = { x?: T, y?: T, z?: T, 0?: T, 1?: T, 2?: T };
type Triplet<T> = T | [T, T, T] | TripletObj<T>;
export interface CubeArgs extends TripletObj<number> {
  sideLength?: number,
  s?: number,
  dimensions?: Triplet<number>,
  d?: Triplet<number>,
  center?: Triplet<boolean>,
  c?: Triplet<boolean>,
  cx?: boolean,
  cy?: boolean,
  cz?: boolean,
}

export const cube: Component<[CubeArgs], LeafElement<Cube>> =
  new Component<[CubeArgs], LeafElement<Cube>>("cube", (n): LeafElement<Cube> => {
    let xyzT: Triplet<number> =
      n.sideLength ??
      n.s ??
      n.dimensions ??
      n.d ??
      [n.x ?? 1, n.y ?? 1, n.z ?? 1]

    const xyzA: [number, number, number] =
      typeof xyzT === "number" ?
        [xyzT, xyzT, xyzT] :
        [xyzT[0] ?? xyzT.x ?? 0, xyzT[1] ?? xyzT.y ?? 0, xyzT[2] ?? xyzT.z ?? 0]

    const cT: Triplet<boolean> =
      n.center ??
      n.c ??
      [n.cx ?? true, n.cy ?? true, n.cz ?? true]

    const cA: [boolean, boolean, boolean] =
      typeof cT === "boolean" ?
        [cT, cT, cT] :
        [cT[0] ?? cT.x ?? true, cT[1] ?? cT.y ?? true, cT[2] ?? cT.z ?? true]

    const cP: [number, number, number] = [
      cA[0] ? 0 : xyzA[0] / 2,
      cA[1] ? 0 : xyzA[1] / 2,
      cA[2] ? 0 : xyzA[2] / 2,
    ]

    return Element.create(Cube.create(Vector3.create(cP), Vector3.create(xyzA)));
  })

