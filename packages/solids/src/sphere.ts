
import { Mesh, Vector3 } from "@escad/mesh";
import {
  Element,
  Id,
  Component,
  LeafProduct,
  createProductTypeUtils,
  Conversion,
  conversionRegistry,
} from "@escad/core";
import { Diff } from "@escad/csg";

const tau = Math.PI * 2;

const sphereId = Id.create(__filename, "@escad/solids", "0", "Sphere");

export interface Sphere extends LeafProduct {
  readonly type: typeof sphereId,
  readonly radius: number,
  readonly slices: number,
  readonly stacks: number,
}

export const Sphere = {
  create: (radius: number, slices: number, stacks: number): Sphere => ({
    type: sphereId,
    radius,
    slices,
    stacks,
  }),
  ...createProductTypeUtils<Sphere, "Sphere">(sphereId, "Sphere"),
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
  fromType: Sphere.id,
  toType: Mesh.id,
  convert: async (sphere: Sphere): Promise<Mesh> => {
    const { radius, slices, stacks } = sphere;

    const v = (theta: number, phi: number) => {
      theta *= tau / slices;
      phi *= tau / stacks;
      phi /= 2;
      return Vector3.create(
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      )
    }

    return Mesh.create([...Array(slices)].flatMap((_, i) =>
      [...Array(stacks)].flatMap((_, j) => {
        let vs = [];

        vs.push(v(i, j));
        if(j > 0)
          vs.push(v(i + 1, j));
        if(j < stacks - 1)
          vs.push(v(i + 1, j + 1));
        vs.push(v(i, j + 1));

        return Mesh.fromVertsFaces(vs, [[...Array(vs.length)].map((_, i) => i)]).faces;
      })
    ));
  },
})

type SphereArgs = {
  r: number,
  slices?: number,
  stacks?: number,
  t?: number,
  i?: number,
  ir?: number,
  unionDiff?: boolean,
  ud?: boolean,
};

export const sphere: Component<[SphereArgs], Element<Sphere>> =
  new Component<[SphereArgs], Element<Sphere>>("sphere", ({
    r = 1,
    slices = 16,
    stacks = 8,
    t = r,
    i = r - t, ir = i,
    unionDiff = false, ud = unionDiff,
  }) => {
    let os = Sphere.create(r, slices, stacks);
    if(!ir)
      return new Element(os);
    let is = Sphere.create(ir, slices, stacks);
    return new Element(ud ? [os, is] : Diff.create(os, is));
  })

export const hollowSphere = sphere;
