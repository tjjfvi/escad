
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
  const [display] = [...getViewersForAll(ids)];

  if(!display)
    return <div className="Preview none">
      <span className="header">No viewers found for:</span>
      {[...ids].map((id, i) => <IdComp key={i} id={id}/>)}
    </div>

  const Comp = display.component;
  return <div className={"Preview " + (display.className ?? "")}>
    <Comp inputs={products.map(product => mapProduct(display, product))}/>
  </div>
});
