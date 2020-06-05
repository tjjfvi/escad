import { _Work } from "./Work";
import { Product, FinishedProduct } from "./Product";
import { ConvertibleTo } from "./Conversions";

export type StrictLeaf<T extends Product<T>> = FinishedProduct<T> | _Work<T>;

export type Leaf<T extends Product<T>> = StrictLeaf<ConvertibleTo<T>>;
