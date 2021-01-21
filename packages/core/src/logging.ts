
import { ProductType } from "./Product";
import { inspect, InspectOptionsStylized } from "util";
import { Id } from "./Id";
import { hash } from "./hash";
import { ConversionImpl } from "./Conversions";

interface Loggable {
  [inspect.custom]: (depth: number, options: InspectOptionsStylized) => any,
}

export const formatProductType = (type: ProductType): Loggable =>
  ({
    [inspect.custom]: (depth, options) => {
      const _format = (type: ProductType): string => {
        if(Id.isId(type))
          return options.stylize(type.name, "special");
        if(type instanceof Array)
          return `[${type.map(_format).join(", ")}]`;
        return options.stylize("null", "null")
      };
      return _format(type) + options.stylize("#" + hash(type).slice(0, 8), "undefined");
    }
  })

export const formatConversion = (conversion: ConversionImpl<any, any>): Loggable =>
  ({
    [inspect.custom]: (depth, options) => {
      const fromType = formatProductType(conversion.fromType)[inspect.custom](depth, options);
      const toType = formatProductType(conversion.toType)[inspect.custom](depth, options);
      return `Convserion\n  ${fromType}\n  ${toType}`
    }
  })

const createLogFunction = <T>(format: (value: T) => Loggable) => (...values: T[]): void => {
  console.log(...values.map(format));
}

export const log = {
  conversion: createLogFunction(formatConversion),
  productType: createLogFunction(formatProductType),
}

