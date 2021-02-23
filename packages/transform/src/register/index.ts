
import { tX, tY, tZ, translate, translateX, translateY, translateZ } from "../translate";
import { rX, rY, rZ, rotate, rotateX, rotateY, rotateZ } from "../rotate";
import { sX, sY, sZ, scale, scaleX, scaleY, scaleZ } from "../scale";
import { flip } from "../flip";
import { extendChainables } from "@escad/core";

const transformChainables = {
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

type TransformChainables = typeof transformChainables;

declare global {
  export namespace escad {
    export interface Chainables extends TransformChainables { }
  }
}

extendChainables(transformChainables);
