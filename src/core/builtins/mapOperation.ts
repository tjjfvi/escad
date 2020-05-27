import { Operation } from ".";
import Product from "../Product";
import { Leaf } from "../Work";
import { __Operation__, _OperationBuiltins } from "../Operation";

export const mapOperation = <I extends Product, O extends Product = I>(name: string, func: (i: Leaf<I>) => Leaf<O>) =>
  new Operation<I, O>(name, arg => {
    let x = arg.map(func).toArray();
    return x instanceof Array ? x.length === 1 ? x[0] : x : x;
  });