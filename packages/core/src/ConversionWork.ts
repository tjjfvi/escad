import { LeafProduct, ProductType, FinishedProduct } from "./LeafProduct";
import { Work } from "./Work";
import { ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Id } from "./Id";
import { concat, Serializer } from "tszer";

export class ConversionWork<T extends LeafProduct> extends Work<ConversionWork<T>, T, [ConvertibleTo<T>]> {

  type = ConversionWork;

  static id = new Id("ConversionWork", __filename);

  constructor(public productType: ProductType<T>, child: ConvertibleTo<T>) {
    super([child as any]);
    this.freeze();
  }

  clone([child]: [any]) {
    return new ConversionWork(this.productType, child);
  }

  serialize = ConversionWork.serializer<T>().serialize;

  static serializer = <T extends LeafProduct>(): Serializer<ConversionWork<T>> =>
    concat(
      ConversionWork.childrenReference<[ConvertibleTo<T>]>(),
      () => Product.Registry.reference(),
    ).map<ConversionWork<T>>({
      serialize: work => [work.children, work.productType],
      deserialize: ([children, productType]) => new ConversionWork(productType, children[0]),
    })

  static deserialize = ConversionWork.serializer<any>().deserialize;

  async execute([child]: [FinishedProduct<ConvertibleTo<T>>]) {
    return await Product.ConversionRegistry.convertProduct(this.productType, child).process();
  }

}
