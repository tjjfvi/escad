

const { chainables, operators, Component, arrayish, Hierarchy } = require(".");
const { TransformWork, Matrix4 } = require("./TransformWork");

let rotate = (_x, _y, _z, opts) => {

  if(typeof _y === "object") {
    opts = _y;
    _y = null;
  }

  let [x, y, z] = [0, 1, 2].map(i =>
    typeof _x === "number" ?
      [_x, _y, _z][i] :
      _x && Symbol.iterator in _x ?
        _x[i] :
        _x && "x" in _x && "y" in _x && "z" in _x ?
          _x["xyz"[i]] :
          0
  );

  if(x != null && y == null && z == null) {
    z = x;
    y = 0;
    x = 0;
  }

  [x = 0, y = 0, z = 0] = [x, y, z];

  let { radians = false } = opts || {};

  let matrix = [x, y, z].map((angle, i) => {
    angle *= radians ? 1 : Math.tau / 360;
    return Matrix4["rotate" + "XYZ"[i]](angle);
  }).reduce((a, b) => a.multiply(b));

  return tree => new TransformWork([tree], new Hierarchy("rotate", [tree]), matrix);
};

chainables.rotate = (comp, ...args) => comp(arrayish.mapDeep(comp, rotate(...args)));
operators.rotate = (...args) => tree => new Component(arrayish.mapDeep(tree, rotate(...args)));
