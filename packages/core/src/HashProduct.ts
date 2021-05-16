
import { artifactManager as defaultArtifactManager } from "./ArtifactManager"
import { checkTypeProperty } from "./checkTypeProperty"
import { Hash } from "./Hash"
import { Product, ProductType, _Product } from "./Product"

export interface HashProduct<T extends Product = Product> extends _Product {
  type: "HashProduct",
  hash: Hash<T>,
  productType: Hash<ProductType<T>>,
}

export const HashProduct = {
  create: <T extends Product>(hash: Hash<T>, productType: Hash<ProductType<T>>): HashProduct<T> => ({
    type: "HashProduct",
    hash,
    productType,
  }),
  fromProduct: async <T extends Product>(product: T, artifactManager = defaultArtifactManager) => {
    const [hash, productType] = await Promise.all([
      artifactManager.storeRaw(product),
      artifactManager.storeRaw(Product.getProductType(product)),
    ])
    return HashProduct.create(hash, productType)
  },
  getHashProductType: <T extends HashProduct>(product: T): HashProductType<T> =>
    HashProductType.create(product.productType) as never,
  isHashProduct: checkTypeProperty.string<HashProduct>("HashProduct"),
}

export interface HashProductType<T extends HashProduct = HashProduct> {
  readonly type: "HashProductType",
  readonly productType: T["productType"],
}

export const HashProductType = {
  create: <T extends Product>(productType: Hash<ProductType<T>>): HashProductType<HashProduct<T>> => ({
    type: "HashProductType",
    productType,
  }),
  isHashProductType: checkTypeProperty.string<HashProductType>("HashProductType"),
}
