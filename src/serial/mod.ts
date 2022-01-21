
import { $array } from "./$array.ts"
import { $boolean } from "./$boolean.ts"
import { $buffer } from "./$buffer.ts"
import { $constant } from "./$constant.ts"
import { $map } from "./$map.ts"
import { $number } from "./$number.ts"
import { $object } from "./$object.ts"
import { $set } from "./$set.ts"
import { $string } from "./$string.ts"
import { registerType } from "./typeRegistration.ts"
import { $unknown } from "./$unknown.ts"

registerType("object", $object)
registerType("string", $string)
registerType("number", $number)
registerType("boolean", $boolean)
registerType("null", $constant(null))
registerType("undefined", $constant(undefined))
registerType("Uint8Array", $buffer)
registerType("Array", $array($unknown))
registerType("Map", $map($unknown, $unknown))
registerType("Set", $set($unknown))

// @create-index {"mode":"*"}

export * from "./$array.ts"
export * from "./$boolean.ts"
export * from "./$buffer.ts"
export * from "./$constant.ts"
export * from "./$json.ts"
export * from "./$map.ts"
export * from "./$number.ts"
export * from "./$object.ts"
export * from "./$record.ts"
export * from "./$set.ts"
export * from "./$string.ts"
export * from "./$tuple.ts"
export * from "./$unknown.ts"
export * from "./BufferInfo.ts"
export * from "./Serializer.ts"
export * from "./typeRegistration.ts"

