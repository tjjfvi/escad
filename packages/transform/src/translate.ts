
import { Matrix4 } from "./Matrix4"
import { Mesh } from "@escad/mesh";
import { mapOperation, Operation, Component } from "@escad/core";
import { Transformation } from "./Transformation";

export type TranslateArgs =
  | [number, number, number]
  | [{ x?: number, y?: number, z?: number }]
  | [[number, number, number]]

export const translate: Component<TranslateArgs, Operation<Mesh, Transformation<Mesh>>> =
  new Component<TranslateArgs, Operation<Mesh, Transformation<Mesh>>>("translate", (...args: TranslateArgs) => {
    let triple = args.length === 3 ? args : args[0];
    let arr = triple instanceof Array ? triple : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const;

    let matrix = Matrix4.translate(...arr);

    return mapOperation<Mesh, Transformation<Mesh>>(
      "translate",
      mesh => Transformation.create(matrix, mesh),
    );
  });

export const tX: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("tX", (n: number) => translate({ x: n }));
export const tY: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("tY", (n: number) => translate({ y: n }));
export const tZ: Component<[number], Operation<Mesh, Transformation<Mesh>>> =
  new Component("tZ", (n: number) => translate({ z: n }));

export const translateX = tX;
export const translateY = tY;
export const translateZ = tZ;
