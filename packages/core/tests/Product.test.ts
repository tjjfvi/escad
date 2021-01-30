
import {
  ArrayProduct,
  ArrayProductType,
  createProductTypeUtils,
  Id,
  LeafProduct,
  Product,
  TupleProduct,
  TupleProductType,
} from "..";

const productAId = Id.create(__filename, "@escad/core", "0", "ProductA");
const productBId = Id.create(__filename, "@escad/core", "0", "ProductB");
const productCId = Id.create(__filename, "@escad/core", "0", "ProductC");
interface ProductA extends LeafProduct { readonly type: typeof productAId }
interface ProductB extends LeafProduct { readonly type: typeof productBId }
interface ProductC extends LeafProduct { readonly type: typeof productCId }
const ProductA = {
  create: (): ProductA => ({ type: productAId }),
  id: productAId,
  ...createProductTypeUtils<ProductA, "ProductA">(productAId, "ProductA")
}
const ProductB = {
  create: (): ProductB => ({ type: productBId }),
  id: productBId,
  ...createProductTypeUtils<ProductB, "ProductB">(productBId, "ProductB")
}
const ProductC = {
  create: (): ProductC => ({ type: productCId }),
  id: productCId,
  ...createProductTypeUtils<ProductC, "ProductC">(productCId, "ProductC")
}

describe("createProductTypeUtils", () => {
  test("Consistent keys", () => {
    expect(Object.keys(ProductA)).toMatchSnapshot();
  })
  test(".productType", () => {
    expect(ProductA.productType).toMatchSnapshot();
  })
  describe(".isProductA", () => {
    const productA = ProductA.create();
    const productB = ProductB.create();
    test("Matches productA", () => {
      expect(ProductA.isProductA(productA)).toEqual(true)
    })
    test("Doesn't match productB", () => {
      expect(ProductA.isProductA(productB)).toEqual(false)
    })
    // Type guard
    const product: ProductA | null = ProductA.isProductA(productB) ? productB : null;
    product;
  })
})

const createProduct = () => TupleProduct.create([
  ProductA.create(),
  TupleProduct.create([]),
  ArrayProduct.create([ProductA.create(), ProductA.create()]),
  TupleProduct.create([ProductA.create(), ProductB.create(), ProductC.create()]),
])

// eslint-disable-next-line func-call-spacing
describe.each<readonly [string, () => Product]>([
  ["ProductA", () => ProductA.create()],
  ["TupleProduct<[]>", () => TupleProduct.create([])],
  ["TupleProduct<[ProductA, ProductB]>", () => TupleProduct.create([ProductA.create(), ProductB.create()])],
  ["ArrayProduct<ProductA>", () => ArrayProduct.create([ProductA.create(), ProductA.create()])],
  ["Complex", () => createProduct()]
] as const)("%s", (_, createProduct) => {
  describe(".create", () => {
    expect(createProduct()).toMatchSnapshot();
  })
  describe("Product.isProduct", () => {
    expect(Product.isProduct(createProduct())).toBe(true);
  })
  describe("Product.getProductType", () => {
    expect(Product.getProductType(createProduct())).toMatchSnapshot();
  })
  describe("Product.isProduct with correct ProductType", () => {
    expect(Product.isProduct(createProduct(), Product.getProductType(createProduct()))).toBe(true);
  })
  describe("Product.isProduct with wrong ProductType", () => {
    test.each([
      ["ProductC", ProductC.productType],
      ["ArrayProduct<ProductC>", ArrayProductType.create(ProductC.productType)],
      ["TupleProduct<[ProductA, ProductC]>", TupleProductType.create([ProductA.productType, ProductC.productType])]
    ] as const)("%s", (_, productType) => {
      expect(Product.isProduct(createProduct(), productType)).toBe(false);
    })
  })
})

describe("Product.getProductType", () => {
  test("Throw on invalid product", () => {
    expect(() => Product.getProductType(null as never)).toThrowErrorMatchingSnapshot();
  })
})

describe("ArrayProduct.create", () => {
  test("Throws on []", () => {
    expect(() => ArrayProduct.create([])).toThrowErrorMatchingSnapshot();
  })
})