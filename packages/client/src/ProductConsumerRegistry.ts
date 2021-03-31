import { ConversionRegistry, Product, ProductType, ProductTypeish } from "@escad/core"

export interface ProductConsumer<P extends Product, T, C> {
  context: C,
  type: ProductTypeish<P>,
  map: (product: P) => T | Promise<T>,
}

export class ProductConsumerRegistry<C extends ProductConsumer<any, any, any>> {

  constructor(public conversionRegistry: ConversionRegistry){}

  registrations = new Set<C>()

  public *findConsumers(productType: ProductType){
    for(const viewerRegistration of this.registrations.values())
      if(this.conversionRegistry.has(productType, ProductType.fromProductTypeish(viewerRegistration.type)))
        yield viewerRegistration
  }

  private *findContexts(productType: ProductType){
    for(const consumer of this.findConsumers(productType))
      yield consumer.context
  }

  async mapProduct(context: C["context"], product: Product){
    for(const consumer of this.findConsumers(Product.getProductType(product)))
      if(consumer.context === context)
        return await consumer.map(await this.conversionRegistry.convertProduct(
          ProductType.fromProductTypeish(consumer.type),
          product,
        ))
  }

  *getConsumersForAll(types: Iterable<ProductType>): Iterable<C["context"]>{
    const displayss = [...types].map(t => new Set(this.findContexts(t)))
    main: for(const display of displayss.shift() ?? []) {
      for(const set of displayss)
        if(!set.has(display))
          continue main
      yield display
    }
  }

}
