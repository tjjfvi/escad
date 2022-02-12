import { Component, Element, GenericOperation } from "../chaining/mod.ts";
import { type Hkt } from "../utils/mod.ts";
import { NameHierarchy } from "../hierarchy/mod.ts";
import { Product } from "../product/mod.ts";

export const label = Component.create(
  "label",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, _show: boolean = true) =>
    GenericOperation.create<Product, Hkt.Identity<Product>>(
      "label",
      async <T extends Product>(value: Element<T>) =>
        Element.applyHierarchy(
          value,
          NameHierarchy.create({
            name,
            linkedProducts: (await value.hierarchy)?.linkedProducts,
          }),
        ),
      { overrideHierarchy: false },
    ),
  { showOutput: false },
);
