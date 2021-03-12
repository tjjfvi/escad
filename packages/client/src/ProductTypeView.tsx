
import React, { Fragment } from "react";
import { LeafProductType, ArrayProductType, TupleProductType, ProductType } from "@escad/core";
import { IdView } from "./IdView";

export const ProductTypeView = ({ productType }: { productType: ProductType }) => {
  if(LeafProductType.isLeafProductType(productType))
    return <IdView id={productType.id}/>;
  if(TupleProductType.isTupleProductType(productType))
    return <span className="ProductType">
      {"["}
      {productType.elementTypes.map((x, i) =>
        <Fragment key={i}>
          {i === 0 ? null : ", "}
          <ProductTypeView productType={x}/>
        </Fragment>,
      )}
      {"]"}
    </span>
  if(ArrayProductType.isArrayProductType(productType))
    return <span className="ProductType">
      <ProductTypeView productType={productType.elementType}/>
      {"[]"}
    </span>
  throw new Error("Invalid product type passed to ProductTypeView")
}
