
import { chainables, operators } from ".";
import { operatorMap } from "./operatorMap";
import { TransformWork } from "./TransformWork";
import { Matrix4 } from "./Matrix4"

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

  return tree => new TransformWork([tree], null, matrix);
};

chainables.translate = (el, ...args) => el(operatorMap("translate", el(), translate(...args)));
operators.translate = (...args) => (...tree) => operatorMap("translate", tree, translate(...args));

"XYZ".split("").map(L => {
  let l = L.toLowerCase();
  chainables["t" + L] = (el, n) => chainables.translate(el, { [l]: n });
  operators["t" + L] = n => operators.translate({ [l]: n });
})
