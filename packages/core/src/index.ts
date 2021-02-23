
export * from "./chainables";
import { chainables } from "./chainables";
import { Element, Elementish } from "./Element";
import { Product } from "./Product";

const escadFunc = <T extends Product>(...a: Elementish<T>[]) => new Element(a.length === 1 ? a[0] : a)

const escad = new Proxy(escadFunc, {
  get: (target, key) =>
    key in target ?
      target[key as keyof typeof target] :
      chainables[key as keyof typeof chainables]
}) as typeof escadFunc & typeof chainables;

export default escad;

// @create-index {"mode":"*"}

export * from './ArrayProduct';
export * from './ArtifactManager';
export * from './ArtifactStore';
export * from './Component';
export * from './Context';
export * from './ContextStack';
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
export * from './Thing';
export * from './Timer';
export * from './TupleProduct';
export * from './UnknownProduct';
export * from './WeakCache';
export * from './chainables';
export * from './checkTypeProperty';
export * from './depthFirst';
export * from './hash';
export * from './logging';
export * from './mapOperation';

