import "../stylus/RawViewer.styl";
import { Hierarchy } from "../core/mod.ts";
import { UnknownProduct, UnknownProductType } from "../core/mod.ts";
import React from "react.ts";
import { observer, useFromPromise } from "rhobo.ts";
import { HierarchyView } from "./HierarchyView.ts";
import { viewerRegistry } from "./ViewerRegistry.ts";
import { Loading } from "./Loading.ts";

viewerRegistry.register<UnknownProduct, { product: UnknownProduct }>({
  type: UnknownProductType.create(),
  map: async (x) => ({ product: x }),
  context: {
    name: "Raw",
    className: "RawViewer",
    component: observer(({ inputs }) => {
      const hierarchyPromise = Promise.all(inputs).then((x) =>
        Hierarchy.from(x.map((x) => x.product.product), true)
      );
      const hierarchy = useFromPromise(hierarchyPromise)();
      if (!hierarchy) {
        return <Loading />;
      }
      return (
        <div className="inner">
          <HierarchyView hierarchy={hierarchy} />
        </div>
      );
    }),
    weight: 0,
  },
});
