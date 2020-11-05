
import { ConversionRegistry } from "./ConversionRegistry";
import { LeafProduct } from "./LeafProduct"
import { CompoundProduct } from "./CompoundProduct"
import { ProductManager } from "./ProductManager";

export type Product = LeafProduct | CompoundProduct<readonly Product[]>;

export const Product = {
  ConversionRegistry: new ConversionRegistry(),
  // Registry: new Registry<ProductType>("ProductRegistry"),
  Manager: new ProductManager(),
}
