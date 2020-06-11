import { Id } from "./Id";

export interface Product {
  sha: string,
  type: Id,
  buffer: Buffer,
}
