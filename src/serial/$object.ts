import { Serializer } from "./Serializer.ts"
import { $record } from "./$record.ts"
import { $unknown } from "./$unknown.ts"

export const $object = $record($unknown) as Serializer<object>
