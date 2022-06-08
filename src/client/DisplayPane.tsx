/** @jsxImportSource solid */
// @style "./stylus/DisplayPane.styl"
import {
  createResource,
  createSignal,
  Dynamic,
  For,
  JSX,
  Show,
} from "../deps/solid.ts";
import {
  ArtifactManager,
  ConversionRegistry,
  ExportTypeInfo,
  ExportTypeRegistry,
  Hash,
  Product,
  ProductType,
  ProductTypeish,
} from "../core/mod.ts";
import { Loading } from "./Loading.tsx";
import { MemoShow } from "./MemoShow.tsx";

export interface DisplayPaneProps {
  artifactManager: ArtifactManager;
  conversionRegistry: ConversionRegistry;
  productHashes: readonly Hash<Product>[] | undefined;
  exportTypes: readonly ExportTypeInfo[];
}

export const DisplayPane = (props: DisplayPaneProps) => {
  const [sig] = createResource(() => props.productHashes, async (hashes) => {
    const productPromises = hashes.map(async (hash) => {
      const product = await props.artifactManager.lookupRaw(hash);
      if (!product) throw new Error("Unexpected null");
      return product;
    });
    const [viewers, stats, exportTypes] = await Promise.all([
      filterDisplays(
        viewerRegistry,
        props.conversionRegistry,
        productPromises,
      ),
      filterDisplays(
        statRegistry,
        props.conversionRegistry,
        productPromises,
      ),
      filterDisplays(
        props.exportTypes,
        props.conversionRegistry,
        productPromises,
      ),
    ]);
    return { productPromises, viewers, stats, exportTypes };
  });
  const [selectedViewer, setSelectedViewer] = createSignal<Viewer<any>>();
  const viewer = () =>
    selectedViewer() && sig()!.viewers.includes(selectedViewer()!)
      ? selectedViewer()!
      : sig()!.viewers[0]!;
  return (
    <MemoShow
      when={sig()}
      fallback={
        <div class="DisplayPane loading">
          <Loading />
        </div>
      }
    >
      {(sig) => (
        <Show
          when={sig().productPromises.length}
          fallback={
            <div class="DisplayPane none">
              <span class="header">No products to display.</span>
            </div>
          }
        >
          <div class="DisplayPane">
            <Dynamic
              component={viewer().component}
              productPromises={sig().productPromises.map(async (product) =>
                await props.conversionRegistry.convertProduct(
                  ProductType.fromProductTypeish(viewer().productType),
                  await product,
                )
              )}
            />
            <div class="menubar">
              <div>
                <For each={sig().viewers}>
                  {(v) => (
                    <span onClick={() => setSelectedViewer(v)}>
                      {v.name}
                    </span>
                  )}
                </For>
                <span>Viewer</span>
              </div>
              <Show when={sig().exportTypes.length}>
                <div>
                  <For each={sig().exportTypes}>
                    {(exportType) => (
                      <span
                        onClick={() =>
                          exportProducts(
                            props.artifactManager,
                            exportType,
                            sig().productPromises,
                          )}
                      >
                        {exportType.name}
                      </span>
                    )}
                  </For>
                  <span>Export</span>
                </div>
              </Show>
            </div>
            <Stats
              conversionRegistry={props.conversionRegistry}
              stats={sig().stats}
              productPromises={sig().productPromises}
            />
          </div>
        </Show>
      )}
    </MemoShow>
  );
};

interface StatsProps {
  conversionRegistry: ConversionRegistry;
  stats: Stat<any>[];
  productPromises: Promise<Product>[];
}
const Stats = (
  props: StatsProps,
) => {
  const [statsOpen, setStatsOpen] = createSignal(false);
  return (
    <Show when={props.stats.length}>
      <div class="Stats" classList={{ open: statsOpen() }}>
        <span onClick={() => setStatsOpen((x) => !x)}>Stats</span>
        <div class="content">
          <For each={props.stats}>
            {(stat) => {
              const [value] = createResource(
                () => props.productPromises,
                async (productPromises) => {
                  const products = await Promise.all(
                    productPromises.map(async (productPromise) => {
                      const product = await productPromise;
                      return props.conversionRegistry.convertProduct(
                        ProductType.fromProductTypeish(stat.productType),
                        product,
                      );
                    }),
                  );
                  return await stat.value(products);
                },
              );
              return (
                <div class="stat">
                  <span>{stat.label}</span>
                  <Show when={value()} fallback={<Loading />}>
                    <span>{value()}</span>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
};

export interface Viewer<P extends Product> {
  name: string;
  productType: ProductTypeish<P>;
  component: (props: { productPromises: Promise<P>[] }) => JSX.Element;
  weight: number;
}

export interface Stat<P extends Product> {
  label: string;
  productType: ProductTypeish<P>;
  value: (products: P[]) => string | Promise<string>;
  weight: number;
}

const viewerRegistry: Viewer<any>[] = [];
const statRegistry: Stat<any>[] = [];

export function registerViewer<P extends Product>(viewer: Viewer<P>) {
  viewerRegistry.push(viewer);
  viewerRegistry.sort((a, b) => b.weight - a.weight);
}

export function registerStat<P extends Product>(stat: Stat<P>) {
  statRegistry.push(stat);
  statRegistry.sort((a, b) => b.weight - a.weight);
}

async function filterDisplays<D extends { productType: ProductTypeish<any> }>(
  displays: readonly D[],
  conversionRegistry: ConversionRegistry,
  productPromises: Promise<Product>[],
): Promise<D[]> {
  return (await Promise.all(displays.map(async (display) => {
    const displayProductType = ProductType.fromProductTypeish(
      display.productType,
    );
    let anyFalse = false;
    let resolveFalse: (value: false) => void;
    let falsePromise = new Promise((r) => resolveFalse = r);
    const result = await Promise.race([
      falsePromise,
      Promise.all(
        productPromises.map(async (productPromise) => {
          const product = await productPromise;
          if (anyFalse) return;
          const result = await conversionRegistry.has(
            Product.getProductType(product),
            displayProductType,
          );
          console.log(displayProductType);
          if (!result) {
            anyFalse = true;
            resolveFalse(false);
          }
        }),
      ).then(() => !anyFalse),
    ]);
    return result ? [display] : [];
  }))).flat();
}

async function exportProducts(
  artifactManager: ArtifactManager,
  exportType: ExportTypeInfo,
  productPromises: Promise<Product>[],
) {
  const data = await artifactManager.lookupRef([
    ExportTypeRegistry.artifactStoreId,
    exportType.id,
    await Promise.all(productPromises),
  ]);
  if (!(data instanceof Uint8Array)) throw new Error("Export failed");
  download(
    URL.createObjectURL(new Blob([data])),
    "export" + exportType.extension,
  );
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  a.click();
}
