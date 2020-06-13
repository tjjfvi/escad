
import { Parameter, Id } from "@escad/core";
import { string, concat, Serializer, SerializeFunc, DeserializeFunc, array } from "tszer";

export type ObjectParamGeneric = Record<string, Parameter<any, any>>;

export interface ObjectParamArgs<O extends ObjectParamGeneric> {
  name?: string,
  desc?: string,
  children: O,
}

export type ObjectParamGenericValue<O extends ObjectParamGeneric> = {
  [K in keyof O]: O[K] extends Parameter<any, infer T> ? T : never;
}

export class ObjectParam<O extends ObjectParamGeneric>
  extends Parameter<ObjectParam<O>, ObjectParamGenericValue<O>> implements ObjectParamArgs<O> {

  static id = new Id("ObjectParam", __filename);

  type = ObjectParam;

  children: O;

  constructor({ name, desc, children }: ObjectParamArgs<O>){
    super(mapObj(children, v => v.defaultValue), name, desc);
    this.children = mapObj(children, (v, k) => v.withDefaultName(k as string));
    this.freeze();
  }

  valueSerializer = () =>
    array(concat(
      (string() as Serializer<keyof O & string>),
      ([key]) => this.children[key].valueSerializer(),
    )).map<ObjectParamGenericValue<O>>({
      serialize: obj => Object.keys(this.children).map(k => [k, obj[k]]),
      deserialize: entries => Object.assign({}, ...entries.map(([k, v]) => ({ [k]: v }))),
    })

  static serializer: <O extends ObjectParamGeneric>() => Serializer<ObjectParam<O>> = (
    <O extends ObjectParamGeneric>() => concat(
      string(),
      string(),
      array(concat(
        (string() as Serializer<keyof O & string>),
        Parameter.Manager.reference(),
        ([, pm]) => pm.valueSerializer(),
      ))
    ).map<ObjectParam<O>>({
      serialize: op => [op.name, op.desc, Object.entries(op.children).map(([k, v]) => [k, v, v.defaultValue])],
      deserialize: ([name, desc, childrenEntries]) =>
        new ObjectParam({
          name,
          desc,
          children: Object.assign({}, ...childrenEntries.map(([k, v]) => ({ [k]: v }))),
        })
    })
  )

  rename(name: string){
    return new ObjectParam({ ...this, name });
  }

  serialize: SerializeFunc<ObjectParam<O>> = ObjectParam.serializer<O>().serialize;

  static deserialize: DeserializeFunc<ObjectParam<any>> = ObjectParam.serializer<any>().deserialize;

}

export const objectParam = <O extends ObjectParamGeneric>(args: ObjectParamArgs<O>) => new ObjectParam(args);

const mapObj = <O extends {}>(o: O, f: (v: O[keyof O], k: keyof O) => any) =>
  Object.assign({}, ...Object.entries(o).map(([k, v]: any) => ({ [k]: f(v, k) })));
