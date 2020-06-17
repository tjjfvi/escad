import { ArtifactManager } from "./ArtifactManager";
import { concat, Serializer } from "tszer";
import { Parameter } from "./Parameter";
import { Readable } from "stream";

export class ParameterManager extends ArtifactManager<Parameter<any, any>> {

  subdir = "parameters";

  serializer = () => concat(
    Parameter.Registry.reference(),
    ([parameterType]) => Parameter.getSerializer(parameterType),
  ).map<Parameter<any, any>>({
    serialize: param => [param.type, param],
    deserialize: ([, param]) => param,
  })

  serialize(param: Parameter<any, any>){
    return Serializer.serialize(this.serializer(), param);
  }

  deserialize(stream: Readable): Promise<Parameter<any, any>>{
    return Serializer.deserialize(this.serializer(), stream);
  }

  getSha(param: Parameter<any, any>){
    return param.sha;
  }

}
