
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

export * from './ArtifactManager';
export * from './Component';
export * from './ConversionRegistry';
export * from './ConversionWork';
export * from './Conversions';
export * from './Element';
export * from './ExportManager';
export * from './ExportType';
export * from './ExportTypeManager';
export * from './ExportTypeRegistry';
export * from './ExtensibleFunction';
export * from './Hierarchy';
export * from './HierarchyManager';
export * from './Id';
export * from './IdManager';
export * from './Leaf';
export * from './Operation';
export * from './Parameter';
export * from './ParameterManager';
export * from './LeafProduct';
export * from './ProductManager';
export * from './ReadonlyArtifactManager';
export * from './Registry';
export * from './Timer';
export * from './WeakCache';
export * from './Work';
export * from './WorkManager';
export * from './builtins';
export * from './hash';
export * from './hex';
export * from './mapOperation';

