import { ArtifactManager } from "./ArtifactManager";
import { Hierarchy } from "./Hierarchy";

export class HierarchyManager extends ArtifactManager<Hierarchy> {

  subdir = "hierarchy";

  async deserialize(buffer: Buffer){
    return await Hierarchy.deserialize(buffer);
  }

  async serialize(hierarchy: Hierarchy){
    const serialized = hierarchy.serialize();
    await Promise.all([
      ...hierarchy.children,
      hierarchy.output,
      hierarchy.fullOutput,
      hierarchy.input
    ].map(h => h === hierarchy ? null : h?.writePromise))
    return serialized;
  }

}
