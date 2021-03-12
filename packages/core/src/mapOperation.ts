import { Operation, OperationOptions } from "./Operation"
import { Product } from "./Product"
import { Element } from "./Element"

export const mapOperation = (
 <I extends Product, O extends Product = I>(
    name: string,
    func: (i: I) => O,
    opts: OperationOptions = {},
  ) =>
    Operation.create<I, O>(name, arg => {
      const argArr = Element.toArray(arg)
      const flattenedArg = argArr.length === 1 ? argArr[0] : arg
      const output = Element.map(flattenedArg, func)
      return output
    }, opts)
)
