
import { TransformWork } from "./TransformWork";
import { Matrix4 } from "./Matrix4"
import { Mesh } from "./Mesh";
import Operation from "../Operation";
import Component from "../Component";
import { __Element__ } from "../Element";
import { mapOperation } from "./mapOperation";

type TranslateArgs =
  | [number, number, number]
  | [{ x?: number, y?: number, z?: number }]
  | [[number, number, number]]
export const translate: Component<TranslateArgs, Operation<Mesh, Mesh>> =
  new Component<TranslateArgs, Operation<Mesh, Mesh>>("translate", (...args: TranslateArgs) => {
    let triple = args.length === 3 ? args : args[0];
    let arr = triple instanceof Array ? triple : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const;

    let matrix = Matrix4.translate(...arr);

    return mapOperation<Mesh>("translate", leaf => new TransformWork(leaf, matrix));
  });

export const tX: Component<[number], Operation<Mesh, Mesh>> =
  new Component("tX", (n: number) => translate({ x: n }));
export const tY: Component<[number], Operation<Mesh, Mesh>> =
  new Component("tY", (n: number) => translate({ y: n }));
export const tZ: Component<[number], Operation<Mesh, Mesh>> =
  new Component("tZ", (n: number) => translate({ z: n }));

export const translateX = tX;
export const translateY = tY;
export const translateZ = tZ;
