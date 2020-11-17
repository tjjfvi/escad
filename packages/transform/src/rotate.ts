
import { Matrix4 } from "./Matrix4"
import { Mesh } from "@escad/mesh";
import { Component, Operation, mapOperation } from "@escad/core";
import { Transformation } from "./Transformation";

const tau = Math.PI * 2;

type RotateOpts = { unit?: "radians" | "rad" | "degrees" | "deg" };
type RotateArgs =
  | [number, number, number, RotateOpts?]
  | [{ x?: number, y?: number, z?: number }, RotateOpts?]
  | [{ x?: number, y?: number, z?: number } & RotateOpts]
  | [[number, number, number], RotateOpts?]

export const rotate: Component<RotateArgs, Operation<Mesh, Transformation<Mesh>>> =
  new Component<RotateArgs, Operation<Mesh, Transformation<Mesh>>>("rotate", (...args: RotateArgs) => {
    let [first] = args;
    let triple =
    args.length === 3 ?
      args :
      args.length === 4 ?
        args :
        typeof first === "object" ?
          first :
          [0, 0, 0] as [0, 0, 0]
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

    let m = Matrix4.multiply(Matrix4.multiply(Matrix4.rotateX(x), Matrix4.rotateY(y)), Matrix4.rotateZ(z));

    return mapOperation<Mesh, Transformation<Mesh>>("rotate", leaf => Transformation(m, leaf));
  });

export const rX: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("rX", (n: number) => rotate({ x: n }));
export const rY: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("rY", (n: number) => rotate({ y: n }));
export const rZ: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("rZ", (n: number) => rotate({ z: n }));

export const rotateX = rX;
export const rotateY = rY;
export const rotateZ = rZ;
