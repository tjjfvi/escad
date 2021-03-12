
import { Viewer, ViewerInput } from "./Viewer"
import { conversionRegistry, Product } from "@escad/core"
import { ProductConsumer, ProductConsumerRegistry } from "./ProductConsumerRegistry"

export type ViewerRegistration<P extends Product, T extends ViewerInput> = ProductConsumer<P, T, Viewer<T>>

export class ViewerRegistry extends ProductConsumerRegistry<ViewerRegistration<any, any>> {

  register<P extends Product, T extends ViewerInput>(registration: ViewerRegistration<P, T>){
    this.registrations.add(registration)
  }

}

export const viewerRegistry = new ViewerRegistry(conversionRegistry)
