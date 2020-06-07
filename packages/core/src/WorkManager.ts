import { Work, _Work } from "./Work";
import { ArtifactManager } from "./ArtifactManager";
import { concat, Serializer } from "tszer";

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

  async deserialize(buffer: Buffer): Promise<_Work<any, any>>{
    return await Serializer.deserialize(this.serializer(), buffer);
  }

  getSha(work: _Work){
    return work.sha;
  }

}
