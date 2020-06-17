
import { Product, FinishedProduct } from "./Product";
import { ArtifactManager } from "./ArtifactManager";
import { concat, Serializer } from "tszer";
import { Readable } from "stream";

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

  deserialize(stream: Readable): Promise<FinishedProduct<Product>>{
    return Serializer.deserialize(this.serializer(), stream);
  }

  getSha(product: Product){
    return product.sha;
  }

}
