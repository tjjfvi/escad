
import { Product } from "./Product";

type CompoundType<T extends readonly Product[]> = {
  readonly [K in keyof T]: K extends number ? T[K]["type"] : T[K]
};

export interface CompoundProduct<T extends readonly Product[]> {
  readonly type: CompoundType<T>,
  readonly children: T,
}

export const CompoundProduct = {};
