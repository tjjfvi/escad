import { ArtifactManager } from "./ArtifactManager";
import { Hierarchy } from "./Hierarchy";
import { Serializer } from "tszer";
import { Readable } from "stream";

export class HierarchyManager extends ArtifactManager<Hierarchy> {

  subdir = "hierarchy";

  deserialize(stream: Readable){
    return Serializer.deserialize(Hierarchy.serializer(), stream);
  }

  serialize(hierarchy: Hierarchy){
    return Serializer.serialize(Hierarchy.serializer(), hierarchy);
  }

  getSha(hierarchy: Hierarchy){
    return hierarchy.sha;
  }

}
