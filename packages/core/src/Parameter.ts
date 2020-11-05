import { Id } from "./Id";
import { ArtifactManager } from "./ArtifactManager";

export interface Parameter<V> {
  type: Id<Parameter<V>>,
  defaultValue: V,
  name?: string,
  desc?: string,
}

declare const parameterManagerIdSymbol: unique symbol;
const parameterManagerId = Id<typeof parameterManagerIdSymbol>("parameter", __filename, "0");

export const Parameter = {
  Manager: new ArtifactManager<Parameter<any>>(parameterManagerId),
}
