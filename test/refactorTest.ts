
import "../packages/builtins/register";
import { cube } from "../packages/solids/dist";

export default () => (
  cube({ s: 1 })
    .sub(cube({ s: .9 }))
    .sub(cube({ s: 1, c: false }))
)
