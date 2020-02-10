

const { chainables, operators, Component, arrayish } = require(".");
const { PointMapWork } = require("./PointMapWork");
const { Vector3 } = require("./Vector3");

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

  return tree => new PointMapWork([tree], v => [x, y, z].reduce((V, angle, i) => {
    angle *= radians ? 1 : Math.tau / 360;

    let [xa, ya] = [[2, 1], [0, 2], [1, 0]][i];
    let za = i;

    let c = Math.cos(angle);
    let s = Math.sin(angle);

    let v = [V.x, V.y, V.z];
    let nv = [];

    nv[za] = v[za];
    nv[xa] = v[xa] * c - v[ya] * s;
    nv[ya] = v[xa] * s + v[ya] * c;

    return new Vector3(...nv);

  }, v), x, y, z, radians, "rotate");
};

chainables.rotate = (comp, ...args) => comp(arrayish.mapDeep(comp, rotate(...args)));
operators.rotate = (...args) => tree => new Component(arrayish.mapDeep(tree, rotate(...args)));
