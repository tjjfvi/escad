
const { chainables, operators, Component } = require(".");
const { PointMapWork } = require("./PointMapWork");
const { Vector3 } = require("./Vector3");

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
  let translateVector = new Vector3(x, y, z);

  return tree => new PointMapWork([tree], v => v.add(translateVector));
};

chainables.translate = (comp, ...args) => comp(translate(...args)(comp()));
operators.translate = (...args) => tree => new Component(translate(...args)(tree));
