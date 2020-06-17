import { Work, _Work } from "./Work";
import { ArtifactManager } from "./ArtifactManager";
import { concat, Serializer } from "tszer";
import { Readable } from "stream";

export class WorkManager extends ArtifactManager<Work<any>> {

  subdir = "trees";

  serializer = () => concat(
    Work.Registry.reference(),
    ([workType]) => Work.getSerializer(workType),
  ).map<_Work>({
    serialize: work => [work.type, work],
    deserialize: ([, work]) => work,
  })

  serialize(work: Work<any, any>){
    return Serializer.serialize(this.serializer(), work);
  }

  deserialize(stream: Readable): Promise<_Work<any, any>>{
    return Serializer.deserialize(this.serializer(), stream);
  }

  getSha(work: _Work){
    return work.sha;
  }

}
