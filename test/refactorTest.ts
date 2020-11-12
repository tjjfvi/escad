
import { cube } from "../packages/solids/dist";
import { Mesh } from "../packages/mesh/dist";

const myCube = cube({ s: 1 }).val;
Mesh.convert(myCube).then(console.log)
