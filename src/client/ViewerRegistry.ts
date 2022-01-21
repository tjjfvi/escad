
import { Viewer, ViewerInput } from "./Viewer.ts"
import { conversionRegistry, Product } from "../core/mod.ts"
import { ProductConsumer, ProductConsumerRegistry } from "./ProductConsumerRegistry.ts"

export type ViewerRegistration<P extends Product, T extends ViewerInput> = ProductConsumer<P, T, Viewer<T>>

export class ViewerRegistry extends ProductConsumerRegistry<any, any, Viewer<any>> {

  register<P extends Product, T extends ViewerInput>(registration: ViewerRegistration<P, T>){
    this.registrations.add(registration)
  }

}

export const viewerRegistry = new ViewerRegistry(conversionRegistry)
