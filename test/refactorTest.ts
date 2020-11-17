
import "../packages/transform/register";
import { Element, ElementOut } from "../packages/core/dist";
import { cube } from "../packages/solids/dist";
import { Mesh } from "../packages/mesh/dist";
import { flip, Transformation, translate } from "../packages/transform/dist";

type T = Extract<"flip", keyof Element<Transformation<Mesh>>>;
type U = ElementOut<Transformation<Mesh>, typeof flip>;

translate(1, 2, 3)(cube({ s: 1 })).flip()
  .toArrayFlat()
  .map(async product => {
    console.log(translate(1, 2, 3)(cube({ s: 1 })))
    console.log(product);
    console.log((await Mesh.convert(product)).faces.map(x => x.points));
  })
