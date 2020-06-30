import { Id } from "./Id";
import { Serializer, DeserializeFunc, WriteChunk } from "tszer";
import { Registry } from "./Registry";
import { Sha, hash } from "./hash";
import { ParameterManager } from "./ParameterManager";

export abstract class Parameter<P extends Parameter<P, V>, V> {

  static Registry = new Registry<ParameterType<any, any>>("ParameterRegistry");
  static Manager = new ParameterManager();

  frozen = false;
  sha: Promise<Sha>;

  writePromise?: Promise<void>;

  constructor(public defaultValue: V, public name: string = "", public desc = ""){
    this.sha = null as any;
  }

  abstract rename(name: string): P

  withDefaultName(name: string): P{
    return this.name ? this as any as P : this.rename(name);
  }

  freeze(){
    if(this.frozen)
      throw new Error("Parameter.freeze should only be called once");
    this.sha = hash(Parameter.Manager.serialize(this));
    this.frozen = true;
    this.writePromise = this.sha.then(sha => Parameter.Manager.store(sha, Promise.resolve(this)).then(() => {}));
    Object.freeze(this);
  }

  abstract type: ParameterType<P, V>;

  abstract valueSerializer: () => Serializer<V>

  abstract serialize(value: P, writeChunk: WriteChunk): Promise<void>;

  static getSerializer<P extends Parameter<P, V>, V>(parameterType: ParameterType<P, V>){
    return new Serializer({
      deserialize: parameterType.deserialize,
      serialize: (v, wc) => v.serialize(v, wc),
    });
  }

}

export interface ParameterType<P extends Parameter<P, V>, V> {
  id: Id,
  deserialize: DeserializeFunc<P>,
}
