
import React from "react";
import { messenger } from "./Messenger";
import { getViewersForAll, mapProduct } from "./ViewerRegistration";
import { observer, useComputed, fromProm } from "rhobo";
import { IdComp } from "./Id";

export const Preview = observer(() => {
  const products = useComputed(() => fromProm(Promise.all(messenger.products()))).use()().use()() ?? [];
  if(!products)
    return <></>;

  const ids = new Set(products.map(p => p.type));
  const [viewer] = [...getViewersForAll(ids)];

  if(!viewer)
    return <div className="Preview none">
      <span className="header">No viewers found for:</span>
      {[...ids].map((id, i) => <IdComp key={i} id={id}/>)}
    </div>

  return <div className={"Preview " + (viewer.className ?? "")}>
    <viewer.component inputs={products.map(product => mapProduct(viewer, product))}/>
  </div>
});
