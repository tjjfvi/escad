
class _Hex {

  declare private _hex: true;

}
export type Hex = string & _Hex

export const unHex = (hex: Hex): Buffer => Buffer.from(hex, "hex")

export const hex = (b: Buffer): Hex => b.toString("hex") as Hex;
