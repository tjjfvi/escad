import { Matrix4 } from "../Matrix4.ts";
import { Mesh } from "../Mesh.ts";
import {
  Component,
  ConvertibleOperation,
  mapOperation,
  TupleProduct,
} from "../../core/mod.ts";
import { Transform, Transformation } from "../Transformation.ts";

export type TranslateArgs =
  | [number, number, number]
  | [{ x?: number; y?: number; z?: number }]
  | [[number, number, number]];

export const translate: Component<
  TranslateArgs,
  ConvertibleOperation<Mesh, Transformation<Mesh>>
> = Component.create("translate", (...args: TranslateArgs) => {
  let triple = args.length === 3 ? args : args[0];
  let arr = triple instanceof Array
    ? triple
    : [triple.x ?? 0, triple.y ?? 0, triple.z ?? 0] as const;

  let matrix = Matrix4.translate(...arr);

  return mapOperation(
    "translate",
    (mesh) => Transform.create(TupleProduct.create([matrix, mesh] as const)),
    { showOutput: false },
  );
}, { showOutput: false });

export const tX: Component<
  [number],
  ConvertibleOperation<Mesh, Transformation<Mesh>>
> = Component.create("tX", (n: number) => translate({ x: n }), {
  showOutput: false,
});
export const tY: Component<
  [number],
  ConvertibleOperation<Mesh, Transformation<Mesh>>
> = Component.create("tY", (n: number) => translate({ y: n }), {
  showOutput: false,
});
export const tZ: Component<
  [number],
  ConvertibleOperation<Mesh, Transformation<Mesh>>
> = Component.create("tZ", (n: number) => translate({ z: n }), {
  showOutput: false,
});

export const translateX = tX;
export const translateY = tY;
export const translateZ = tZ;
