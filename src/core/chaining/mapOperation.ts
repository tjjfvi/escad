import { Product } from "../product/mod.ts";
import { Promisish } from "../utils/mod.ts";
import { Operation, OperationOptions } from "./Operation.ts";
import { Element, Elementish } from "./Element.ts";

export const mapOperation = (
  <I extends Product, O extends Product = I>(
    name: string,
    func: (value: I, full: Element<I>) => Promisish<Elementish<O>>,
    opts: OperationOptions = {},
  ) =>
    Operation.create<I, O>(name, async (arg) => {
      const argArr = await Element.toArray(arg);
      const flattenedArg = argArr.length === 1 ? argArr[0] : arg;
      const output = Element.map(flattenedArg, (value) => func(value, arg));
      return output;
    }, opts)
);
