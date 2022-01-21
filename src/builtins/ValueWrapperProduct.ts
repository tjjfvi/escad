import { createLeafProductUtils, Id, LeafProduct } from "../core/mod.ts"

const valueWrapperProductId = Id.create(import.meta.url, "@escad/builtins", "LeafProduct", "ValueWrapperProduct")

export interface ValueWrapperProduct<T = unknown> extends LeafProduct {
  readonly type: typeof valueWrapperProductId,
  readonly value: T,
}

export const ValueWrapperProduct = {
  create: <T>(value: T): ValueWrapperProduct<T> => ({
    type: valueWrapperProductId,
    value,
  }),
  ...createLeafProductUtils<ValueWrapperProduct, "ValueWrapperProduct">(
    valueWrapperProductId,
    "ValueWrapperProduct",
  ),
  id: valueWrapperProductId,
}
