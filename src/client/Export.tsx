import {
  conversionRegistry,
  ExportTypeInfo,
  ExportTypeRegistry,
  Product,
} from "../core/mod.ts";
import React from "../deps/react.ts";
import { observer } from "../deps/rhobo.ts";
import { ClientState } from "./ClientState.ts";
import { ProductConsumerRegistry } from "./ProductConsumerRegistry.ts";
import { usePromise } from "./usePromise.ts";

export const Export = observer(() => {
  const state = React.useContext(ClientState.Context);
  const consumerRegistry = new ProductConsumerRegistry<
    Product,
    Product,
    ExportTypeInfo
  >(conversionRegistry);
  consumerRegistry.registrations = new Set(
    state.exportTypes().map((e) => ({
      type: e.productType,
      context: e,
      map: (x) => x,
    })),
  );
  const products = state.products();
  const exportTypes = usePromise(async () => {
    const productTypes = products.map(Product.getProductType);
    return await consumerRegistry.getContextsForAll(productTypes);
  }, [products]);
  if (exportTypes?.length) {
    return (
      <div>
        {exportTypes.map((exportType) => (
          <span
            key={exportType.id}
            onClick={() => exportProducts(state, exportType)}
          >
            {exportType.name}
          </span>
        ))}
        <span>Export</span>
      </div>
    );
  }
  return null;
});

async function exportProducts(state: ClientState, exportType: ExportTypeInfo) {
  const url = state.hashToUrl(
    await state.lookupRefHash([
      ExportTypeRegistry.artifactStoreId,
      exportType.id,
      state.products.value,
    ]),
  );
  console.log(url);
  download(url, "export" + exportType.extension);
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
