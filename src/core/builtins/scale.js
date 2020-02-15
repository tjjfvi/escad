
const { chainables, operators } = require(".");
const { operatorMap } = require("./operatorMap");
const { TransformWork, Matrix4 } = require("./TransformWork");

let scale = (_x, _y, _z) => {
  let [x = 0, y = 0, z = 0] = [0, 1, 2].map(i =>
    typeof _x === "number" ?
      [_x, _y || _x, _z || _x][i] :
      _x && Symbol.iterator in _x ?
        _x[i] :
        _x && ("x" in _x || "y" in _x || "z" in _x) ?
          _x["xyz"[i]] :
          0
  );
  let matrix = Matrix4.scale(x, y, z);

  return tree => new TransformWork([tree], null, matrix);
};

chainables.scale = (comp, ...args) => comp(operatorMap("scale", comp(), scale(...args)));
operators.scale = (...args) => tree => operatorMap("scale", tree, scale(...args));
