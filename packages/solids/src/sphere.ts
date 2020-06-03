
import { Mesh, Vector3 } from "@escad/mesh";
import { diff } from "@escad/csg";
import { Work, Element, Id, Component } from "@escad/core";

const tau = Math.PI * 2;

type SphereWorkArgs = [number, number, number];

class SphereWork extends Work<SphereWork, Mesh, []> {

  type = SphereWork;

  static id = new Id("SphereWork", __filename);

  constructor(public args: SphereWorkArgs){
    super([])
    this.freeze();
  }

  clone(){
    return new SphereWork(this.args);
  }

  async execute(){
    let [r, slices, stacks] = this.args;

    let v = (theta: number, phi: number) => {
      theta *= tau / slices;
      phi *= tau / stacks;
      phi /= 2;
      return new Vector3(
        Math.sin(theta) * Math.sin(phi) * r,
        Math.cos(theta) * Math.sin(phi) * r,
        Math.cos(phi) * r,
      )
    }

    return new Mesh([...Array(slices)].flatMap((_, i) =>
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
    )).finish();
  }

  serialize(){
    return Buffer.from(JSON.stringify(this.args));
  }

  static deserialize(_c: [], buf: Buffer){
    return new SphereWork(JSON.parse(buf.toString("utf8")));
  }

}

Work.Registry.register(SphereWork);

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

export const sphere: Component<[SphereArgs], Element<Mesh>> = new Component("sphere", ({
  r = 1,
  slices = 16,
  stacks = 8,
  t = r,
  i = r - t, ir = i,
  unionDiff = false, ud = unionDiff,
}) => {
  let os = new SphereWork([r, slices, stacks]);
  if(!ir)
    return new Element(os);
  let is = new SphereWork([ir, slices, stacks]);
  return ud ? new Element([os, is]) : diff(os, is);
})

export const hollowSphere = sphere;
