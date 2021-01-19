
import React, { Fragment } from "react";
import { Id, ProductType } from "@escad/core";
import { IdView } from "./IdView";

export const ProductTypeView = ({ productType }: { productType: ProductType }) =>
  Id.isId(productType) ?
    <IdView id={productType}/> :
    <span className="ProductType">
      {"["}
      {(productType as ProductType[]).map((x, i) =>
        <Fragment key={i}>
          {i === 0 ? null : ", "}
          <ProductTypeView productType={x}/>
        </Fragment>
      )}
      {"]"}
    </span>
