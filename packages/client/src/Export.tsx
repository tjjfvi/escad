
import { conversionRegistry, ExportTypeInfo, ExportTypeRegistry, Product } from "@escad/core";
import React from "react";
import { observer } from "rhobo";
import { messenger } from "./Messenger";
import { ProductConsumer, ProductConsumerRegistry } from "./ProductConsumerRegistry";

type ExportTypeProductConsumer<P extends Product> = ProductConsumer<P, P, ExportTypeInfo>;

export const Export = observer(() => {
  const consumerRegistry = new ProductConsumerRegistry<ExportTypeProductConsumer<any>>(conversionRegistry);
  consumerRegistry.registrations = new Set(messenger.exportTypes().map(e => ({
    type: e.productType,
    context: e,
    map: x => x,
  })))
  const productTypes = messenger.products().map(Product.getProductType);
  const exportTypes = [...consumerRegistry.getConsumersForAll(productTypes)];
  if(exportTypes.length)
    return (
      <div>
        {
          exportTypes.map(exportType =>
            <span key={exportType.id.full} onClick={() => exportProducts(exportType)}>{exportType.name}</span>
          )
        }
        <span>Export</span>
      </div>
    )
  return null;
})

async function exportProducts(exportType: ExportTypeInfo){
  const url = await messenger.lookupRefUrl([
    ExportTypeRegistry.artifactStoreId,
    exportType.id,
    messenger.products.value,
  ]);
  console.log(url);
  download(url, "export" + exportType.extension)
}

function download(url: string, filename: string){
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
