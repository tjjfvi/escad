
const { chainables, operators, Hierarchy, Component, arrayish } = require(".");
const { TransformWork, Matrix4 } = require("./TransformWork");

let translate = (_x, _y, _z) => {
  let [x = 0, y = 0, z = 0] = [0, 1, 2].map(i =>
    typeof _x === "number" ?
      [_x, _y, _z][i] :
      _x && Symbol.iterator in _x ?
        _x[i] :
        _x && ("x" in _x || "y" in _x || "z" in _x) ?
          _x["xyz"[i]] :
          0
  );
  let matrix = Matrix4.translate(x, y, z);

  return tree => new TransformWork([tree], new Hierarchy("translate", tree), matrix);
};

chainables.translate = (comp, ...args) => comp(arrayish.mapDeep(comp(), translate(...args)));
operators.translate = (...args) => tree => new Component(arrayish.mapDeep(tree, translate(...args)));
