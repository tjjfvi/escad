import { Operation, OperationOptions } from "./Operation.ts";
import { Product } from "./Product.ts";
import { Element, Elementish } from "./Element.ts";
import { Promisish } from "./Promisish.ts";

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
