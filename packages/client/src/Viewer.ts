
import { Product } from "@escad/core";

export interface ViewerInput {
  product: Product,
}

export interface Viewer<I extends ViewerInput> {
  className?: string,
  name: string,
  component: (props: { inputs: Promise<I>[] }) => JSX.Element,
  weight: number,
}


