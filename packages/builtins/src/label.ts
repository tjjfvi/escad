import { Component, ConvertibleTo, Element, NameHierarchy, Operation } from "@escad/core"
import { Mesh } from "./Mesh"

export const label = Component.create(
  "label",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, _show: boolean = true) =>
    Operation.create(
      "label",
      async (value: Element<ConvertibleTo<Mesh>>) =>
        Element.applyHierarchy(
          value,
          NameHierarchy.create({
            name,
            linkedProducts: (await value.hierarchy)?.linkedProducts,
          }),
        ),
      { overrideHierarchy: false },
    ),
  { showOutput: false },
)
