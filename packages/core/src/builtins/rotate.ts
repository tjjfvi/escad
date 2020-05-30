
import { TransformWork } from "./TransformWork";
import { Matrix4 } from "./Matrix4"
import { Mesh } from "./Mesh";
import { Component, Operation } from ".";
import { mapOperation } from "./mapOperation";

const tau = Math.PI * 2;

type RotateOpts = { unit?: "radians" | "rad" | "degrees" | "deg" };
type RotateArgs =
  | [number, number, number, RotateOpts?]
  | [{ x?: number, y?: number, z?: number }, RotateOpts?]
  | [{ x?: number, y?: number, z?: number } & RotateOpts]
  | [[number, number, number], RotateOpts?]

export const rotate: Component<RotateArgs, Operation<Mesh, Mesh>> =
  new Component<RotateArgs, Operation<Mesh, Mesh>>("rotate", (...args: RotateArgs) => {
    let [first] = args;
    let triple = args.length === 3 ? args : args.length === 4 ? args : typeof first === "object" ? first : [0, 0, 0] as [0, 0, 0];
    let opts =
      args.length === 4 ?
        args[3] :
        args.length === 2 ?
          args[1] :
          typeof first === "object" && "unit" in first ?
            first :
            undefined
    let arr = triple instanceof Array ? triple : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const;

    let [x, y, z] = arr;

    let { unit = "deg" } = opts ?? {};
    let radians = unit === "rad" || unit === "radians";
    let multiplier = radians ? 1 : tau / 360

    x *= multiplier;
    y *= multiplier;
    z *= multiplier;

    let m = Matrix4.rotateX(x).rotateY(y).rotateZ(z);

    return mapOperation<Mesh>("rotate", leaf => new TransformWork(leaf, m));
  });

export const rX: Component<[number], Operation<Mesh, Mesh>> =
  new Component("rX", (n: number) => rotate({ x: n }));
export const rY: Component<[number], Operation<Mesh, Mesh>> =
  new Component("rY", (n: number) => rotate({ y: n }));
export const rZ: Component<[number], Operation<Mesh, Mesh>> =
  new Component("rZ", (n: number) => rotate({ z: n }));

export const rotateX = rX;
export const rotateY = rY;
export const rotateZ = rZ;
