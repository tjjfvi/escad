import React, { Fragment } from "react.ts";
import {
  ArrayProductType,
  LeafProductType,
  ProductType,
  TupleProductType,
} from "../core/mod.ts";
import { IdView } from "./IdView.ts";

export const ProductTypeView = (
  { productType }: { productType: ProductType },
) => {
  if (LeafProductType.isLeafProductType(productType)) {
    return <IdView id={productType.id} />;
  }
  if (TupleProductType.isTupleProductType(productType)) {
    return (
      <span className="ProductType">
        {"["}
        {productType.elementTypes.map((x, i) => (
          <Fragment key={i}>
            {i === 0 ? null : ", "}
            <ProductTypeView productType={x} />
          </Fragment>
        ))}
        {"]"}
      </span>
    );
  }
  if (ArrayProductType.isArrayProductType(productType)) {
    return (
      <span className="ProductType">
        <ProductTypeView productType={productType.elementType} />
        {"[]"}
      </span>
    );
  }
  throw new Error("Invalid product type passed to ProductTypeView");
};
