
import { LeafProduct } from "./LeafProduct";
import { ArtifactManager } from "./ArtifactManager";
import { Sha } from "./hash";
import { Id } from "./Id";

export class ProductManager extends ArtifactManager<FinishedProduct<LeafProduct>, { id: Sha, product: any }> {

  subdir = "products"

  dehydrate(product: FinishedProduct<LeafProduct>){
    return { id: product.type.id.sha, product: product.dehydrate() };
  }

  rehydrate(obj: { id: Sha, product: any }): Promise<FinishedProduct<LeafProduct>>{
    return Product.Registry.get(Id.get(obj.id) ?? (() => {
      throw new Error("...")
    })()).rehydrate(obj);
  }

}
