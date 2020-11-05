import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";
import { Id } from "./Id";

export class IdManager extends ReadonlyArtifactManager<Id, string> {

  subdir = "ids";

  dehydrate(id: Id){
    return id.toString();
  }

}
