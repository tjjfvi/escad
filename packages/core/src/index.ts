
export * from "./builtins";
import { builtins } from "./builtins";
import { Element, Elementish } from "./Element";
import { LeafProduct } from "./LeafProduct";

const escadFunc = <T extends LeafProduct>(...a: Elementish<T>[]) => new Element(a.length === 1 ? a[0] : a)

const escad = new Proxy(escadFunc, {
  get: (target, key) =>
    key in target ?
      target[key as keyof typeof target] :
      builtins[key as keyof typeof builtins]
}) as typeof escadFunc & typeof builtins;

export default escad;

// @create-index {"mode":"*"}

export * from './ArrayProduct';
export * from './ArtifactManager';
export * from './ArtifactStore';
export * from './Component';
export * from './ConversionRegistry';
export * from './Conversions';
export * from './Element';
export * from './ExportType';
export * from './ExportTypeRegistry';
export * from './ExtensibleFunction';
export * from './HashMap';
export * from './Hierarchy';
export * from './Id';
export * from './LeafProduct';
export * from './MultiHashMap';
export * from './Operation';
export * from './Product';
export * from './Timer';
export * from './TupleProduct';
export * from './WeakCache';
export * from './builtins';
export * from './checkTypeProperty';
export * from './depthFirst';
export * from './hash';
export * from './logging';
export * from './mapOperation';

