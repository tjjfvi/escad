
import "../stylus/Preview.styl"
import React, { useContext, useEffect, useState } from "react"
import { viewerRegistry } from "./ViewerRegistry"
import { observer, useObservable } from "rhobo"
import { Product } from "@escad/core"
import { Export } from "./Export"
import { Viewer } from "./Viewer"
import { ClientState } from "./ClientState"
import { Loading } from "./Loading"

export const Preview = observer(() => {
  const state = useContext(ClientState.Context)
  const products = state.products.use()()
  const viewerObs = useObservable.use<Viewer<any>>()
  const productTypes = products.map(Product.getProductType)
  const [viewers, setViewers] = useState<Viewer<any>[] | null>(null)

  useEffect(() => {
    setViewers(null)
    viewerRegistry.getContextsForAll(productTypes).then(viewers =>
      setViewers(viewers?.sort((a, b) => b.weight - a.weight)),
    )
  }, [products])

  if(!products.length)
    return <div className="Preview none">
      <span className="header">No products to display.</span>
    </div>

  if(!viewers)
    return <div className="Preview loading">
      <Loading/>
    </div>

  const selectedViewer = viewerObs()
  const viewer =
    selectedViewer && viewers.includes(selectedViewer)
      ? selectedViewer
      : viewers[0] ?? null

  if(!viewer)
    return <div className="Preview none">
      <span className="header">No viewers found for these products.</span>
    </div>

  return <div className={"Preview " + (viewer.className ?? "")}>
    <viewer.component inputs={products.map(product => viewerRegistry.mapProduct(viewer, product))}/>
    <div className="menubar">
      <div>
        {viewers.map((v, i) =>
          <span key={i} onClick={() => viewerObs(v)}>{v.name}</span>,
        )}
        <span>Viewer</span>
      </div>
      <Export/>
    </div>
  </div>
})
