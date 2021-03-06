
import "../stylus/RawViewer.styl"
import { Hierarchy } from "@escad/core"
import { UnknownProduct, UnknownProductType } from "@escad/core"
import React from "react"
import { observer, useFromPromise } from "rhobo"
import { HierarchyView } from "./HierarchyView"
import { viewerRegistry } from "./ViewerRegistry"
import { Loading } from "./Loading"

viewerRegistry.register<UnknownProduct, { product: UnknownProduct }>({
  type: UnknownProductType.create(),
  map: async x => ({ product: x }),
  context: {
    name: "Raw",
    className: "RawViewer",
    component: observer(({ inputs }) => {
      const hierarchyPromise = Promise.all(inputs).then(x => Hierarchy.from(x.map(x => x.product.product), true))
      const hierarchy = useFromPromise(hierarchyPromise)()
      if(!hierarchy)
        return <Loading/>
      return <div className="inner"><HierarchyView hierarchy={hierarchy}/></div>
    }),
    weight: 0,
  },
})
