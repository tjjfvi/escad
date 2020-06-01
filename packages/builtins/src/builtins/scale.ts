
import { TransformWork } from "./TransformWork";
import { Matrix4 } from "./Matrix4"
import { Mesh } from "./Mesh";
import { FlipWork } from "./flip";
import { mapOperation } from "./mapOperation";
import { Component, Operation } from "@escad/core";

type ScaleArgs =
  | [number]
  | [number, number, number]
  | [{ x?: number, y?: number, z?: number }]
  | [[number, number, number]]
export const scale: Component<ScaleArgs, Operation<Mesh, Mesh>> =
  new Component<ScaleArgs, Operation<Mesh, Mesh>>("scale", (...args: ScaleArgs) => {
    let triple =
      args.length === 3 ?
        args :
        typeof args[0] === "number" ?
          [args[0], args[0], args[0]] as [number, number, number] :
          args[0]
    let arr = triple instanceof Array ? triple : [triple.x ?? 1, triple.y ?? 1, triple.z ?? 1] as const;

    let matrix = Matrix4.scale(...arr);

    let sign = Math.sign(arr[0] * arr[1] * arr[2]);
    let shouldFlip = sign === -1;

    return mapOperation<Mesh>("scale", leaf => {
      let transformed = new TransformWork(leaf, matrix);
      return shouldFlip ? new FlipWork(transformed) : transformed;
    });
  });

export const sX: Component<[number], Operation<Mesh, Mesh>> = new Component("sX", (n: number) => scale({ x: n }));
export const sY: Component<[number], Operation<Mesh, Mesh>> = new Component("sY", (n: number) => scale({ y: n }));
export const sZ: Component<[number], Operation<Mesh, Mesh>> = new Component("sZ", (n: number) => scale({ z: n }));

export const scaleX = sX;
export const scaleY = sY;
export const scaleZ = sZ;
