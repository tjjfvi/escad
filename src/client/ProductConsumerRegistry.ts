import { ConversionRegistry, Product, ProductType, ProductTypeish } from "../core/mod.ts"

export interface ProductConsumer<P extends Product, T, C> {
  context: C,
  type: ProductTypeish<P>,
  map: (product: P) => T | Promise<T>,
}

export class ProductConsumerRegistry<P extends Product, T, C> {

  constructor(public conversionRegistry: ConversionRegistry){}

  registrations = new Set<ProductConsumer<P, T, C>>()

  public findConsumers(productType: ProductType){
    return [...this.registrations.values()].map(async viewerRegistration =>
      await this.conversionRegistry.has(productType, ProductType.fromProductTypeish(viewerRegistration.type))
        ? viewerRegistration
        : null,
    )
  }

  async mapProduct(context: C, product: Product){
    const consumers = await Promise.all(this.findConsumers(Product.getProductType(product)))
    const consumer = consumers.find(consumer => consumer?.context === context)
    if(!consumer) return null
    return await consumer.map(await this.conversionRegistry.convertProduct(
      ProductType.fromProductTypeish(consumer.type),
      product,
    ))
  }

  async getContextsForAll(types: Iterable<ProductType>){
    const contextss = await Promise.all([...types].map(async t =>
      new Set(await Promise.all(this.findConsumers(t).map(async x => (await x)?.context))),
    ))
    const results = []
    for(const context of contextss.pop() ?? [])
      if(context && contextss.every(set => set.has(context)))
        results.push(context)
    return results
  }

}
