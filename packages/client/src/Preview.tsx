
import React from "react";
import { messenger } from "./Messenger";
import { getViewersForAll, mapProduct } from "./ViewerRegistration";
import { observer } from "rhobo";
import { Product } from "@escad/core";
import { ProductTypeView } from "./ProductTypeView";

export const Preview = observer(() => {
  const products = messenger.products();

  if(!products.length)
    return <div className="Preview none">
      <span className="header">No products to display.</span>
    </div>

  const productTypes = products.map(Product.getProductType);
  const [viewer] = getViewersForAll(productTypes);

  if(!viewer)
    return <div className="Preview none">
      <span className="header">No viewers found for these products.</span>
    </div>

  return <div className={"Preview " + (viewer.className ?? "")}>
    <viewer.component inputs={products.map(product => mapProduct(viewer, product))}/>
  </div>
});
