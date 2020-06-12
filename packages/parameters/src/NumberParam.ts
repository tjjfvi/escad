
import { Parameter, Id } from "@escad/core";
import { floatLE, optionalBank, flags, string, concat, Serializer, SerializeFunc, DeserializeFunc } from "tszer";

export interface NumberParamArgs {
  defaultValue: number,
  name?: string,
  desc?: string,
  min?: number,
  max?: number,
  integer?: boolean,
}

export class NumberParam extends Parameter<NumberParam, number> implements NumberParamArgs {

  static id = new Id("NumberParam", __filename);

  type = NumberParam;

  min?: number;
  max?: number;
  integer: boolean;

  constructor({ defaultValue, name, desc, min, max, integer = false }: NumberParamArgs){
    super(defaultValue, name, desc);
    this.min = min;
    this.max = max;
    this.integer = integer;
    this.freeze();
  }

  rename(name: string){
    return new NumberParam({ ...this, name });
  }

  valueSerializer: typeof floatLE = floatLE;

  static serializer: () => Serializer<NumberParam> = () => concat(
    floatLE(),
    string(),
    string(),
    flags(1),
    optionalBank(
      floatLE(),
      floatLE(),
    ),
  ).map<NumberParam>({
    serialize: np => [np.defaultValue, np.name, np.desc, [np.integer], [np.min, np.max]],
    deserialize: ([defaultValue, name, desc, [integer], [min, max]]) =>
      new NumberParam({ defaultValue, name, desc, integer, min, max })
  })

  serialize: SerializeFunc<NumberParam> = NumberParam.serializer().serialize;

  static deserialize: DeserializeFunc<NumberParam> = NumberParam.serializer().deserialize;

}

export const numberParam = (args: NumberParamArgs) => new NumberParam(args);
