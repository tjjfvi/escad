
import { Face, Mesh, Vector3 } from "@escad/mesh";
import {
  Element,
  Id,
  Component,
  LeafProduct,
  createLeafProductUtils,
  Conversion,
  conversionRegistry,
  LeafElement,
} from "@escad/core";
import { interpretTriplet, Triplet } from "./helpers";

const tau = Math.PI * 2;

const sphereId = Id.create(__filename, "@escad/solids", "0", "Sphere");

export interface Sphere extends LeafProduct {
  readonly type: typeof sphereId,
  readonly radius: number,
  readonly smooth: number,
  readonly centering: Vector3,
}

export const Sphere = {
  create: (radius: number, smooth: number, centering: Vector3): Sphere => ({
    type: sphereId,
    radius,
    smooth,
    centering,
  }),
  ...createLeafProductUtils<Sphere, "Sphere">(sphereId, "Sphere"),
  id: sphereId,
};


declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/solids/sphere": {
        cylToMesh: Conversion<Sphere, Mesh>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: Sphere.productType,
  toType: Mesh.productType,
  convert: async (sphere: Sphere): Promise<Mesh> => {
    const { radius, smooth, centering } = sphere;
    const center = Vector3.multiplyScalar(centering, radius);
    const slices = 2 * smooth;
    const stacks = smooth;

    const vertex = (i: number, j: number) => {
      const theta = i * tau / slices;
      const phi = j * tau / 2 / stacks;
      return Vector3.create(
        center.x + Math.sin(theta) * Math.sin(phi) * radius,
        center.y + Math.cos(theta) * Math.sin(phi) * radius,
        center.z + Math.cos(phi) * radius,
      )
    }

    return Mesh.create(
      [...Array(slices)].flatMap((_, i) =>
        [...Array(stacks)].flatMap((_, j) => {
          let vertices = [];

          vertices.push(vertex(i, j));
          if(j > 0)
            vertices.push(vertex(i + 1, j));
          if(j < stacks - 1)
            vertices.push(vertex(i + 1, j + 1));
          vertices.push(vertex(i, j + 1));

          return Face.create(vertices)
        })
      )
    );
  },
  weight: 1,
})

type SphereArgs = number | {
  radius: number,
  smooth?: number,
  center?: Triplet<number | boolean>,
};

export const sphere: Component<[SphereArgs], LeafElement<Sphere>> =
  new Component("sphere", args => {
    if(typeof args === "number")
      args = { radius: args };
    args.smooth ??= 16;
    return Element.create(Sphere.create(args.radius, args.smooth * 2, interpretTriplet(args.center, 0)));
  })
