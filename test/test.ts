
import escad from "../src/core";

export default () => {
  return escad.cube({ s: 1 }).diff(escad.cube({ s: 1, c: false }));
}