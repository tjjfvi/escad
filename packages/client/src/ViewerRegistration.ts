
import { Id } from "./Id";
import { Viewer, ViewerInput } from "./Viewer";
import { Product } from "./Product";

export interface ViewerRegistration<T extends ViewerInput> {
  id: Id,
  context: Viewer<T>,
  map: (product: Product) => T,
}

export const productTypeViewers = new Map<Id, ViewerRegistration<any>[]>();

export const registerViewerRegistration = <T extends ViewerInput>(registration: ViewerRegistration<T>) => {
  const { id } = registration;
  const registrations = productTypeViewers.get(id) ?? [];
  productTypeViewers.set(id, registrations);
  registrations.push(registration);
}

export const mapProduct = <T extends ViewerInput>(context: Viewer<T>, product: Product) => {
  const registration = productTypeViewers.get(product.type)?.find(r => r.context === context);
  if(!registration)
    throw new Error(`Could not find registration for product type ${product.type.sha} for context ${context.name}`);
  return registration.map(product);
}

export const getViewersForAll = (types: Iterable<Id>) => {
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

export const getViewers = (type: Id) =>
  new Set(productTypeViewers.get(type)?.map(r => r.context) ?? [])
