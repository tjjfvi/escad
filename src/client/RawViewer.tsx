/** @jsxImportSource solid */
// @style "./stylus/RawViewer.styl"
import { Hierarchy, UnknownProduct } from "../core/mod.ts";
import { UnknownProductType } from "../core/mod.ts";
import { createResource } from "../deps/solid.ts";
import { registerViewer } from "./DisplayPane.tsx";
import { HierarchyView } from "./HierarchyView/mod.ts";
import { Loading } from "./Loading.tsx";
import { MemoShow } from "./MemoShow.tsx";

registerViewer<UnknownProduct>({
  name: "Raw",
  productType: UnknownProductType.create(),
  component: (props) => {
    const [hierarchy] = createResource(
      () => props.productPromises,
      async (productPromises) =>
        await Hierarchy.from(
          (await Promise.all(productPromises)).map((p) => p.product),
          true,
        ),
    );
    return (
      <div class="RawViewer">
        <MemoShow when={hierarchy()} fallback={<Loading />}>
          {(hierarchy) => (
            <div class="inner">
              <HierarchyView hierarchy={hierarchy()} />
            </div>
          )}
        </MemoShow>
      </div>
    );
  },
  weight: 0,
});
