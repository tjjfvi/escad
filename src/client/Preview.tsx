import "./stylus/Preview.styl";
import React from "../deps/react.ts";
import { viewerRegistry } from "./ViewerRegistry.ts";
import { observer, useObservable } from "../deps/rhobo.ts";
import { Product } from "../core/mod.ts";
import { Export } from "./Export.tsx";
import { Viewer } from "./Viewer.ts";
import { ClientState } from "./ClientState.ts";
import { Loading } from "./Loading.tsx";
import { usePromise } from "./usePromise.ts";

export const Preview = observer(() => {
  const state = React.useContext(ClientState.Context);
  const products = state.products.use()();
  const viewerObs = useObservable.use<Viewer<any>>();
  const viewers = usePromise(async () => {
    const productTypes = products.map(Product.getProductType);
    state.viewerStatus("converting");
    const unsortedViewers = await viewerRegistry.getContextsForAll(
      productTypes,
    );
    return unsortedViewers?.sort((a, b) => b.weight - a.weight);
  }, [products]);

  React.useEffect(() => {
  }, [products]);

  if (!products.length) {
    state.viewerStatus("displayed");
    return (
      <div className="Preview none">
        <span className="header">No products to display.</span>
      </div>
    );
  }

  if (!viewers) {
    return (
      <div className="Preview loading">
        <Loading />
      </div>
    );
  }

  const selectedViewer = viewerObs();
  const viewer = selectedViewer && viewers.includes(selectedViewer)
    ? selectedViewer
    : viewers[0] ?? null;

  if (!viewer) {
    return (
      <div className="Preview none">
        <span className="header">No viewers found for these products.</span>
      </div>
    );
  }

  state.viewerStatus("converting");
  const inputs = products.map((product) =>
    viewerRegistry.mapProduct(viewer, product)
  );
  Promise.all(inputs).then(() => state.viewerStatus("displayed"));
  return (
    <div className={"Preview " + (viewer.className ?? "")}>
      <viewer.component inputs={inputs} />
      <div className="menubar">
        <div>
          {viewers.map((v, i) => (
            <span key={i} onClick={() => viewerObs(v)}>{v.name}</span>
          ))}
          <span>Viewer</span>
        </div>
        <Export />
      </div>
    </div>
  );
});
