
Math.tau = 6.283185307179586472128676655;

export * from "./builtins";
import * as builtins from "./builtins";

export default Object.assign((...a) => new builtins.Element(a.length === 1 ? a[0] : a), builtins, builtins.operators);
