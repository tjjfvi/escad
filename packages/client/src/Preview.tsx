
import React from "react";
import { messenger } from "./Messenger";
import { viewerRegistry } from "./ViewerRegistry";
import { observer, useObservable } from "rhobo";
import { Product } from "@escad/core";
import { Export } from "./Export";
import { Viewer } from "./Viewer";

export const Preview = observer(() => {
  const products = messenger.products();
  const viewerObs = useObservable.use<Viewer<any>>();

  if(!products.length)
    return <div className="Preview none">
      <span className="header">No products to display.</span>
    </div>

  const productTypes = products.map(Product.getProductType);
  const viewers = [...viewerRegistry.getConsumersForAll(productTypes)].sort((a, b) => b.weight - a.weight);

  if(!viewerObs.value || !viewers.includes(viewerObs.value)) {
    viewerObs.value = viewers[0] ?? null;
  }

  const viewer = viewerObs.value;

  if(!viewer)
    return <div className="Preview none">
      <span className="header">No viewers found for these products.</span>
    </div>

  return <div className={"Preview " + (viewerObs.value.className ?? "")}>
    <viewer.component inputs={products.map(product => viewerRegistry.mapProduct(viewer, product))}/>
    <div className="menubar">
      <div>
        {viewers.map((v, i) =>
          <span key={i} onClick={() => viewerObs(v)}>{v.name}</span>
        )}
        <span>Viewer</span>
      </div>
      <Export/>
    </div>
  </div>
});
