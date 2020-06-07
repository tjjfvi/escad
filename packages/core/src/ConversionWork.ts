import { Product, ProductType, FinishedProduct } from "./Product";
import { Work } from "./Work";
import { ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Id } from "./Id";
import { concat, Serializer } from "tszer";

export class ConversionWork<T extends Product<T>> extends Work<ConversionWork<T>, T, [ConvertibleTo<T>]> {

  type = ConversionWork;

  static id = new Id("ConversionWork", __filename);

  constructor(public productType: ProductType<T>, child: StrictLeaf<ConvertibleTo<T>>){
    super([child as any]);
    this.freeze();
  }

  clone([child]: [any]){
    return new ConversionWork(this.productType, child);
  }

  serialize = ConversionWork.serializer<T>().serialize;

  static serializer = <T extends Product<T>>(): Serializer<ConversionWork<T>> =>
    concat(
      ConversionWork.childrenReference<[ConvertibleTo<T>]>(),
      () => Product.Registry.reference(),
    ).map<ConversionWork<T>>({
      serialize: work => [work.children, work.productType],
      deserialize: ([children, productType]) => new ConversionWork(productType, children[0]),
    })

  static deserialize = ConversionWork.serializer<any>().deserialize;

  async execute([child]: [FinishedProduct<ConvertibleTo<T>>]){
    return await Product.ConversionRegistry.convertProduct(this.productType, child).process();
  }

}
