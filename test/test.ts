
import escad from "../src/core";

export default () => {
  return escad.diff(escad.cube({ s: 1 }), escad.cube({ s: 1, c: false }));
}