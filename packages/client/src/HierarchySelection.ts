import { Hash, Hierarchy, Product } from "@escad/core"
import { getHierarchyPath, HierarchyPath } from "./HierarchyPath"

export interface HierarchySelectionPart {
  type: "include" | "exclude",
  path: HierarchyPath,
}

export type HierarchySelection = HierarchySelectionPart[]

export function resolveHierarchySelection(selection: HierarchySelection, hierarchy: Hierarchy){
  const selected = new Set<Hash<Product>>()
  for(const selectionPart of selection) {
    const subHierarchy = getHierarchyPath(selectionPart.path, hierarchy)
    if(!subHierarchy?.linkedProducts) continue
    for(const hash of subHierarchy.linkedProducts)
      if(selectionPart.type === "include")
        selected.add(hash)
      else
        selected.delete(hash)
  }
  return selected
}
