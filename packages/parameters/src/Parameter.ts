import { Id } from "@escad/core/src/Id";
import { ArtifactManager } from "@escad/core/src/ArtifactManager";

export interface Parameter<V> {
  readonly type: Id,
  readonly defaultValue: V,
  readonly name?: string,
  readonly desc?: string,
}

declare const parameterManagerIdSymbol: unique symbol;
const parameterManagerId = Id.create<typeof parameterManagerIdSymbol>("parameter", __filename, "0");

export const Parameter = {
  Manager: new ArtifactManager<Parameter<any>>(parameterManagerId),
  rename: <V, T extends Parameter<V>>(parameter: T, name: string): T => ({
    ...parameter,
    name,
  })
}
