
import { tX, tY, tZ, translate, translateX, translateY, translateZ } from "./translate";
import { rX, rY, rZ, rotate, rotateX, rotateY, rotateZ } from "./rotate";
import { sX, sY, sZ, scale, scaleX, scaleY, scaleZ } from "./scale";
import { flip } from "./flip";
import { extendBuiltins } from "@escad/core";

const transformBuiltins = {
  tX,
  tY,
  tZ,
  translate,
  translateX,
  translateY,
  translateZ,
  rX,
  rY,
  rZ,
  rotate,
  rotateX,
  rotateY,
  rotateZ,
  sX,
  sY,
  sZ,
  scale,
  scaleX,
  scaleY,
  scaleZ,
  flip,
}

type TransformBuiltins = typeof transformBuiltins;

declare global {
  export namespace escad {
    export interface Builtins extends TransformBuiltins { }
  }
}

extendBuiltins(transformBuiltins);

// @create-index {"mode":"*"}

export * from './Matrix4';
export * from './PointMapWork';
export * from './TransformWork';
export * from './flip';
export * from './rotate';
export * from './scale';
export * from './translate';

