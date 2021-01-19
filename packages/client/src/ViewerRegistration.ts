
import { Viewer, ViewerInput } from "./Viewer";
import { getProductType, hash, Hex, MultiMap, Product, ProductType } from "@escad/core";

export interface ViewerRegistration<P extends Product, T extends ViewerInput> {
  type: ProductType<P>,
  context: Viewer<T>,
  map: (product: P) => T,
}

export const productTypeViewers = new MultiMap<Hex, ViewerRegistration<any, any>>();

export const registerViewerRegistration =
  async <P extends Product, T extends ViewerInput>(registration: ViewerRegistration<P, T>) => {
    productTypeViewers.add(hash(registration.type), registration);
  }

export const mapProduct = <T extends ViewerInput>(context: Viewer<T>, product: Product) => {
  const productTypeHash = hash(getProductType(product));
  const registration = [...productTypeViewers.getAll(productTypeHash)].find(r => r.context === context);
  if(!registration)
    throw new Error(`Could not find registration for product type ${productTypeHash} for context ${context.name}`);
  return registration.map(product);
}

export const getViewersForAll = (types: Iterable<ProductType>) => {
  const displayss = [...types].map(getViewers);
  const union = new Set((function*(){
    for(const set of displayss)
      yield* set;
  })());
  const intersection = new Set((function*(){
    main: for(const display of union) {
      for(const set of displayss)
        if(!set.has(display))
          continue main;
      yield display;
    }
  })());
  return intersection;
}

export const getViewers = (type: ProductType) =>
  new Set([...productTypeViewers.getAll(hash(type))].map(r => r.context))
