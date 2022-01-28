import { assertEquals, snapshot } from "../../testUtils/mod.ts";
import {
  ArrayProduct,
  ArrayProductType,
  createLeafProductUtils,
  Id,
  LeafProduct,
  Product,
  ProductType,
  TupleProduct,
  TupleProductType,
  UnknownProduct,
} from "../mod.ts";

const productAId = Id.create(
  import.meta.url,
  "@escad/core",
  "LeafProduct",
  "ProductA",
);
const productBId = Id.create(
  import.meta.url,
  "@escad/core",
  "LeafProduct",
  "ProductB",
);
const productCId = Id.create(
  import.meta.url,
  "@escad/core",
  "LeafProduct",
  "ProductC",
);
interface ProductA extends LeafProduct {
  readonly type: typeof productAId;
}
interface ProductB extends LeafProduct {
  readonly type: typeof productBId;
}
interface ProductC extends LeafProduct {
  readonly type: typeof productCId;
}
const ProductA = {
  create: (): ProductA => ({ type: productAId }),
  id: productAId,
  ...createLeafProductUtils<ProductA, "ProductA">(productAId, "ProductA"),
};
const ProductB = {
  create: (): ProductB => ({ type: productBId }),
  id: productBId,
  ...createLeafProductUtils<ProductB, "ProductB">(productBId, "ProductB"),
};
const ProductC = {
  create: (): ProductC => ({ type: productCId }),
  id: productCId,
  ...createLeafProductUtils<ProductC, "ProductC">(productCId, "ProductC"),
};

Deno.test("createLeafProductUtils", async (t) => {
  await t.step("Consistent keys", async () => {
    await snapshot(
      import.meta.url,
      "createLeafProductUtils/keys",
      Object.keys(ProductA),
    );
  });
  await t.step(".productType", async () => {
    await snapshot(
      import.meta.url,
      "createLeafProductUtils/productType",
      ProductA.productType,
    );
  });
  await t.step(".isProductA", async (t) => {
    const productA = ProductA.create();
    const productB = ProductB.create();
    await t.step("Matches productA", () => {
      assertEquals(ProductA.isProductA(productA), true);
    });
    await t.step("Doesn't match productB", () => {
      assertEquals(ProductA.isProductA(productB), false);
    });
    // Type guard
    const product: ProductA | null = ProductA.isProductA(productB)
      ? productB
      : null;
    product;
  });
});

const createProduct = () =>
  TupleProduct.create([
    ProductA.create(),
    TupleProduct.create([]),
    ArrayProduct.create([ProductA.create(), ProductA.create()]),
    TupleProduct.create([
      ProductA.create(),
      ProductB.create(),
      ProductC.create(),
    ]),
    UnknownProduct.create(ProductB.create()),
  ]);
const productTests: [string, () => Product][] = [
  ["ProductA", () => ProductA.create()],
  ["TupleProduct<[]>", () => TupleProduct.create([])],
  [
    "TupleProduct<[ProductA, ProductB]>",
    () => TupleProduct.create([ProductA.create(), ProductB.create()]),
  ],
  [
    "ArrayProduct<ProductA>",
    () => ArrayProduct.create([ProductA.create(), ProductA.create()]),
  ],
  ["UnknownProduct", () => UnknownProduct.create(ProductB.create())],
  ["Complex", () => createProduct()],
];

const altProductTypes: [string, ProductType][] = [
  ["ProductC", ProductC.productType],
  ["ArrayProduct<ProductC>", ArrayProductType.create(ProductC)],
  [
    "TupleProduct<[ProductA, ProductC]>",
    TupleProductType.create([ProductA, ProductC]),
  ],
];

for (const [name, createProduct] of productTests) {
  Deno.test(name, async (t) => {
    await t.step(".create", async () => {
      await snapshot(import.meta.url, `${name}/product`, createProduct());
    });
    await t.step("Product.isProduct", () => {
      assertEquals(Product.isProduct(createProduct()), true);
    });
    await t.step("Product.getProductType", async () => {
      await snapshot(
        import.meta.url,
        `${name}/producType`,
        Product.getProductType(createProduct()),
      );
    });
    await t.step("Product.isProduct with correct ProductType", () => {
      assertEquals(
        Product.isProduct(
          createProduct(),
          Product.getProductType(createProduct()),
        ),
        true,
      );
    });
    await t.step("Product.isProduct with wrong ProductType", () => {
      for (const [_name, productType] of altProductTypes) {
        assertEquals(
          Product.isProduct(
            createProduct(),
            ProductType.fromProductTypeish<Product>(productType),
          ),
          false,
        );
      }
    });
  });
}
