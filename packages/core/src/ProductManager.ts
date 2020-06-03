
import { Id } from "./Id";
import { Product, FinishedProduct } from "./Product";
import { Sha } from "./hash";
import { ArtifactManager } from "./ArtifactManager";

export class ProductManager extends ArtifactManager<FinishedProduct<Product>> {

  subdir = "products"

  deserialize(buffer: Buffer){
    let id = Id.get(new Sha(buffer.slice(0, 32)));
    if(!id)
      return null;
    let product = Product.Registry.get(id).deserialize(buffer.slice(32));
    return product.finish();
  }

  serialize(product: FinishedProduct<any>){
    let serialized = product.serialize();
    return Buffer.concat([product.type.id.sha.buffer, serialized], 32 + serialized.length);
  }

}
