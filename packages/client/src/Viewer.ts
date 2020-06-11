
import React from "react";
import { Product } from "./Product";

export interface ViewerInput {
  product: Product,
}

export interface Viewer<I extends ViewerInput> {
  className?: string,
  name: string,
  component: React.FunctionComponent<{ inputs: I[] }>,
}


