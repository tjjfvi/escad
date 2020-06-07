import { ArtifactManager } from "./ArtifactManager";
import { Hierarchy } from "./Hierarchy";
import { Serializer } from "tszer";

export class HierarchyManager extends ArtifactManager<Hierarchy> {

  subdir = "hierarchy";

  deserialize(buffer: Buffer){
    return Serializer.deserialize(Hierarchy.serializer(), buffer);
  }

  async serialize(hierarchy: Hierarchy){
    const serialized = Serializer.serialize(Hierarchy.serializer(), hierarchy);
    await Promise.all([
      ...hierarchy.children,
      hierarchy.output,
      hierarchy.fullOutput,
      hierarchy.input
    ].map(h => h?.writePromise))
    return serialized;
  }

  getSha(hierarchy: Hierarchy){
    return hierarchy.sha;
  }

}
