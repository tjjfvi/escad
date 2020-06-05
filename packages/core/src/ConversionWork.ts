import { Product, ProductType, FinishedProduct } from "./Product";
import { Work } from "./Work";
import { ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Id } from "./Id";
import { Sha } from "./hash";

export class ConversionWork<T extends Product<T>> extends Work<ConversionWork<T>, T, [ConvertibleTo<T>]> {

  type = ConversionWork;

  static id = new Id("ConversionWork", __filename);

  constructor(public productType: ProductType<T>, child: StrictLeaf<ConvertibleTo<T>>){
    super([child as any]);
    this.freeze();
  }

  clone([child]: [StrictLeaf<ConvertibleTo<T>>]){
    return new ConversionWork(this.productType, child);
  }

  serialize(){
    return this.productType.id.sha.buffer;
  }

  static deserialize<T extends Product<T>>([child]: [any], buffer: Buffer): ConversionWork<T>{
    const id = Id.get(new Sha(buffer));
    if(!id)
      throw new Error("Could not find id referenced in ConversionWork");
    return new ConversionWork(Product.Registry.get(id), child) as any;
  }

  async execute([child]: [FinishedProduct<ConvertibleTo<T>>]){
    return await Product.ConversionRegistry.convertProduct(this.productType, child).process();
  }

}
