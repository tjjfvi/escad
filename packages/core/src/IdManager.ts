import { ReadonlyArtifactManager } from "./ReadonlyArtifactManager";
import { Id } from "./Id";
import { Readable } from "stream";

export class IdManager extends ReadonlyArtifactManager<Id> {

  subdir = "ids";

  serialize(id: Id){
    return Readable.from([Buffer.from(id.toString())]);
  }

}
