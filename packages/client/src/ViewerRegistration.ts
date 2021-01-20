
import { Viewer, ViewerInput } from "./Viewer";
import { conversionRegistry, getProductType, Product, ProductType } from "@escad/core";

export interface ViewerRegistration<P extends Product, T extends ViewerInput> {
  type: ProductType<P>,
  context: Viewer<T>,
  map: (product: P) => T | Promise<T>,
}

export const registrations = new Set<ViewerRegistration<any, any>>();

export const registerViewerRegistration =
  async <P extends Product, T extends ViewerInput>(registration: ViewerRegistration<P, T>) => {
    registrations.add(registration);
  }

export function* findRegistrations(productType: ProductType){
  for(const viewerRegistration of registrations.values())
    if(conversionRegistry.has(productType, viewerRegistration.type))
      yield viewerRegistration;
}

export function* findViewers(productType: ProductType){
  for(const registration of findRegistrations(productType))
    yield registration.context;
}

export const mapProduct = async <T extends ViewerInput>(context: Viewer<T>, product: Product) => {
  for(const registration of findRegistrations(getProductType(product)))
    if(registration.context === context)
      return await registration.map(await conversionRegistry.convertProduct(registration.type, product));
}

export function* getViewersForAll(types: Iterable<ProductType>){
  const displayss = [...types].map(t => new Set(findViewers(t)));
  for(const set of displayss)
    main: for(const display of set) {
      for(const set of displayss)
        if(!set.has(display))
          continue main;
      yield display;
    }
}
