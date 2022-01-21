/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  $string,
  $uint8,
  $unknown,
  registerType,
  Serializer,
} from "../serial/mod.ts";
import { assertNever } from "../assertNever.ts";
import { HashProduct } from "../HashProduct.ts";
import { Id } from "../Id.ts";
import { LeafProduct } from "../LeafProduct.ts";
import { MarkedProduct } from "../MarkedProduct.ts";
import { Product } from "../Product.ts";
import { UnknownProduct } from "../UnknownProduct.ts";
import { $hash } from "./$hash.ts";
import { $id } from "./$id.ts";

export const $product = new Serializer<Product>({
  *s(rootProduct) {
    const stack = [rootProduct];
    while (stack.length) {
      const product = stack.shift()!;
      if (LeafProduct.isLeafProduct(product)) {
        yield* $string.s("LeafProduct");
        yield* $unknown.s(product);
        continue;
      }
      yield* $string.s(product.type);
      if (product.type === "HashProduct") {
        yield* $hash.s(product.hash);
        yield* $hash.s(product.productType);
      } else if (product.type === "MarkedProduct") {
        yield* $id.s(product.marker);
        stack.push(product.child);
      } else if (product.type === "UnknownProduct") {
        stack.push(product.product);
      } else if (
        product.type === "TupleProduct" || product.type === "ArrayProduct"
      ) {
        yield* $uint8.s(product.children.length);
        for (let i = product.children.length - 1; i >= 0; i--) {
          stack.push(product.children[i]);
        }
      } else {
        assertNever(product);
      }
    }
  },
  *d() {
    let result: Product;
    const stack: Array<(product: Product) => void> = [
      (product) => result = product,
    ];
    while (stack.length) {
      const resolve = stack.shift()!;
      const type =
        (yield* $string.d()) as (Exclude<Product["type"], Id> | "LeafProduct");
      if (type === "LeafProduct") {
        resolve((yield* $unknown.d()) as Product);
        continue;
      } else if (type === "HashProduct") {
        const hash = yield* $hash.d();
        const productType = yield* $hash.d();
        resolve(HashProduct.create(hash, productType));
      } else if (type === "MarkedProduct") {
        const marker = yield* $id.d();
        const product: Writable<MarkedProduct> = MarkedProduct.create(
          marker,
          undefined!,
        );
        stack.push((child) => product.child = child);
        resolve(product);
      } else if (type === "UnknownProduct") {
        const product: Writable<UnknownProduct> = UnknownProduct.create(
          undefined!,
        );
        stack.push((child) => product.product = child);
        resolve(product);
      } else if (type === "TupleProduct" || type === "ArrayProduct") {
        const length = yield* $uint8.d();
        const children = Array<Product>(length);
        const product = { type, children };
        for (let i = product.children.length - 1; i >= 0; i--) {
          stack.push((child) => children[i] = child);
        }
        resolve(product);
      } else {
        assertNever(type);
      }
    }
    return result!;
  },
});

registerType("MarkedProduct", $product);
registerType("TupleProduct", $product);
registerType("ArrayProduct", $product);
registerType("HashProduct", $product);
registerType("UnknownProduct", $product);

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};
