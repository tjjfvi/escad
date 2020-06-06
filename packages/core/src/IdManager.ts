import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";
import { Id } from "./Id";

export class IdManager extends ReadonlyArtifactManager<Id> {

  subdir = "ids";

  async serialize(id: Id){
    return Buffer.from(id.toString());
  }

}
