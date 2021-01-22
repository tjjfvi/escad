
import React from "react";
import { messenger } from "./Messenger";
import { getViewersForAll, mapProduct } from "./ViewerRegistration";
import { observer, useComputed, fromProm } from "rhobo";
import { Product } from "@escad/core";
import { ProductTypeView } from "./ProductTypeView";

export const Preview = observer(() => {
  const products = useComputed(() => fromProm(Promise.all(messenger.products()))).use()().use()() ?? [];
  if(!products)
    return <></>;

  const productTypes = products.map(Product.getProductType);
  const [viewer] = [...getViewersForAll(productTypes)];

  if(!viewer)
    return <div className="Preview none">
      <span className="header">No viewers found for:</span>
      {productTypes.map((pt, i) => <ProductTypeView key={i} productType={pt}/>)}
    </div>

  return <div className={"Preview " + (viewer.className ?? "")}>
    <viewer.component inputs={products.map(product => mapProduct(viewer, product))}/>
  </div>
});
