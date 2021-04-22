import { assertNever, Hash, Hierarchy, Product } from "@escad/core"
import { getHierarchyPath, HierarchyPath } from "./HierarchyPath"

export interface HierarchySelectionPart {
  type: "include" | "exclude",
  path: HierarchyPath,
}

export type HierarchySelection = HierarchySelectionPart[]

export function resolveHierarchySelection(hierarchySelection: HierarchySelection, hierarchy: Hierarchy){
  const selectedProducts = new Set<Hash<Product>>()
  for(const selectionPart of hierarchySelection) {
    const subHierarchy = getHierarchyPath(selectionPart.path, hierarchy)
    if(!subHierarchy?.linkedProducts) continue
    for(const productHash of subHierarchy.linkedProducts)
      if(selectionPart.type === "include")
        selectedProducts.add(productHash)
      else if(selectionPart.type === "exclude")
        selectedProducts.delete(productHash)
      else
        assertNever(selectionPart.type)
  }
  return selectedProducts
}
