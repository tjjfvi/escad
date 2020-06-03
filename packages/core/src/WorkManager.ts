import { Work } from "./Work";
import { ArtifactManager } from "./ArtifactManager";
import { Sha } from "./hash";
import { Id } from "./Id";
import { b64 } from "./b64";

export class WorkManager extends ArtifactManager<Work<any>> {

  subdir = "trees";

  serialize(work: Work<any>){
    let childrenLengthBuffer = Buffer.alloc(2);
    childrenLengthBuffer.writeUInt16LE(work.children.length, 0);
    let argsBuf = work.serialize();
    return Buffer.concat([
      work.type.id.sha.buffer,
      childrenLengthBuffer,
      ...work.children.map((c: Work<any>) => c.sha.buffer),
      argsBuf,
    ], 32 + 2 + 32 * work.children.length + argsBuf.length);
  }


  async deserialize(buffer: Buffer): Promise<Work<any>>{
    let idBuffer = buffer.slice(0, 32);
    let childrenLength = buffer.readUInt16LE(32);
    let childShaBuffers = Array(childrenLength).fill(0).map((_, i) =>
      buffer.slice(32 + 2 + i * 32, 32 + 2 + i * 32 + 32)
    );
    let argsBuffer = buffer.slice(32 + 2 + childrenLength * 32);
    let children = await Promise.all(childShaBuffers.map(s => this.lookup(new Sha(s))));
    let id = Id.get(new Sha(idBuffer));
    if(!id)
      throw new Error("Unknown Work Id " + b64(idBuffer));
    let workType = Work.Registry.get(id);
    return workType.deserialize(children, argsBuffer);
  }

}
