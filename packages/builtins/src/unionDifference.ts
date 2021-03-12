
import { Mesh } from "./Mesh"
import { Element, ConvertibleOperation, ConvertibleElementish, Operation } from "@escad/core"
import { Bsp } from "./Bsp"
import { diff } from "./diff"

export const udMeld: ConvertibleOperation<Bsp, Bsp> =
  Operation.create("udMeld", el => {
    let args = Element.toArrayDeep(el)
    if(!(args instanceof Array))
      return [[args], []]
    let dargs: [ConvertibleElementish<Mesh>[], ConvertibleElementish<Mesh>[]] = [[], []]
    for(let arg of args)
      if(arg instanceof Array) {
        dargs[0].push(arg[0])
        dargs[1].push(...arg.slice(1))
      }
      else dargs[0].push(arg)
    return dargs
  })

export const unionDiff: ConvertibleOperation<Bsp, Bsp> =
  Operation.create("unionDiff", el => diff(udMeld(...Element.toArray(el))))

export const unionDiffMeld = udMeld
