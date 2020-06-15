
import { Product, FinishedProduct } from "./Product";
import { ArtifactManager } from "./ArtifactManager";
import { concat, Serializer } from "tszer";

export class ProductManager extends ArtifactManager<FinishedProduct<Product>> {

  subdir = "products"

  serializer = () => concat(
    Product.Registry.reference(),
    ([productType]) => Product.getSerializer(productType),
  ).map<FinishedProduct<Product>>({
    serialize: product => [product.type, product],
    deserialize: ([, product]) => product.finish(),
  })

  serialize(product: FinishedProduct<Product>){
    return Serializer.serialize(this.serializer(), product);
  }

  async deserialize(buffer: Buffer): Promise<FinishedProduct<Product>>{
    return await Serializer.deserialize(this.serializer(), buffer);
  }

  getSha(product: Product){
    return product.sha;
  }

}
