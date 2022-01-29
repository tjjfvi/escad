import { checkTypeProperty } from "./checkTypeProperty.ts";
import { _Hierarchy, Hierarchy } from "./Hierarchy.ts";

export interface ObjectHierarchy extends _Hierarchy {
  readonly type: "ObjectHierarchy";
  readonly children: Record<string, Hierarchy>;
}

export const ObjectHierarchy = {
  create: ({
    children,
    linkedProducts = Hierarchy.flattenLinkedProducts(Object.values(children)),
  }: Omit<ObjectHierarchy, "type">): ObjectHierarchy => ({
    type: "ObjectHierarchy",
    children,
    linkedProducts,
  }),
  from: async (object: Record<string, unknown>, raw = false) =>
    ObjectHierarchy.create({
      children: Object.fromEntries(
        await Promise.all(
          Object.entries(object).map(async (
            [key, value],
          ) => [key, await Hierarchy.from(value, raw)]),
        ),
      ),
    }),
  isObjectHierarchy: checkTypeProperty.string<ObjectHierarchy>(
    "ObjectHierarchy",
  ),
};
