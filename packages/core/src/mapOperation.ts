import { Operation, OperationOptions } from "./Operation"
import { Product } from "./Product"
import { Element, Elementish } from "./Element"
import { Promisish } from "./Promisish"

export const mapOperation = (
 <I extends Product, O extends Product = I>(
    name: string,
    func: (i: I) => Promisish<Elementish<O>>,
    opts: OperationOptions = {},
  ) =>
    Operation.create<I, O>(name, async arg => {
      const argArr = await Element.toArray(arg)
      const flattenedArg = argArr.length === 1 ? argArr[0] : arg
      const output = Element.map(flattenedArg, func)
      return output
    }, opts)
)
