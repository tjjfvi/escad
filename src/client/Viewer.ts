
import { Product } from "../core/mod.ts"

export interface ViewerInput {
  product: Product,
}

export interface Viewer<I extends ViewerInput> {
  className?: string,
  name: string,
  component: (props: { inputs: Promise<I>[] }) => JSX.Element,
  weight: number,
}

