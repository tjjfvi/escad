/** @jsxImportSource solid */
// @style "./stylus/RawViewer.styl"
import { Hierarchy, UnknownProduct } from "../core/mod.ts";
import { UnknownProductType } from "../core/mod.ts";
import { createResource } from "../deps/solid.ts";
import { registerViewer } from "./DisplayPane.tsx";
import { HierarchyView } from "./HierarchyView/mod.ts";
import { Loading } from "./Loading.tsx";

registerViewer<UnknownProduct>({
  type: "Viewer",
  name: "Raw",
  productType: UnknownProductType.create(),
  component: (props) => {
    const [hierarchySig] = createResource(
      () => props.productPromises,
      async (productPromises) =>
        await Hierarchy.from(
          (await Promise.all(productPromises)).map((p) => p.product),
          true,
        ),
    );
    return () => {
      const hierarchy = hierarchySig();
      if (!hierarchy) {
        return (
          <div class="RawViewer">
            <Loading />
          </div>
        );
      }
      return (
        <div class="RawViewer">
          <div class="inner">
            <HierarchyView hierarchy={hierarchy} />
          </div>
        </div>
      );
    };
  },
  weight: 0,
});
