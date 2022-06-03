/** @jsxImportSource solid */
// @style "./stylus/DisplayPane.styl"
import {
  createResource,
  createSignal,
  Dynamic,
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
    const [viewers, exportTypes] = await Promise.all([
      filterDisplays(
        viewerRegistry,
        props.conversionRegistry,
        productPromises,
      ),
      filterDisplays(
        props.exportTypes,
        props.conversionRegistry,
        productPromises,
      ),
    ]);
    return { productPromises, viewers, exportTypes };
  });
  const [selectedViewer, setSelectedViewer] = createSignal<Viewer<any>>();
  return () => {
    const val = sig();
    if (!val) {
      return (
        <div class="DisplayPane loading">
          <Loading />
        </div>
      );
    }
    const { productPromises, viewers, exportTypes } = val;

    if (!productPromises.length) {
      return (
        <div class="DisplayPane none">
          <span class="header">No products to display.</span>
        </div>
      );
    }

    const viewer = () =>
      selectedViewer() && viewers.includes(selectedViewer()!)
        ? selectedViewer()!
        : viewers[0]!;

    return (
      <div class="DisplayPane">
        <Dynamic
          component={viewer().component}
          productPromises={productPromises.map(async (product) =>
            await props.conversionRegistry.convertProduct(
              ProductType.fromProductTypeish(viewer().productType),
              await product,
            )
          )}
        />
        <div class="menubar">
          <div>
            {viewers.map((v) => (
              <span onClick={() => setSelectedViewer(v)}>{v.name}</span>
            ))}
            <span>Viewer</span>
          </div>
          <Show when={exportTypes.length}>
            <div>
              {exportTypes.map((exportType) => (
                <span
                  onClick={() =>
                    exportProducts(
                      props.artifactManager,
                      exportType,
                      productPromises,
                    )}
                >
                  {exportType.name}
                </span>
              ))}
              <span>Export</span>
            </div>
          </Show>
        </div>
      </div>
    );
  };
};

export interface Viewer<P extends Product> {
  type: "Viewer";
  name: string;
  productType: ProductTypeish<P>;
  component: (props: { productPromises: Promise<P>[] }) => JSX.Element;
  weight: number;
}

type Display = Viewer<any> | ExportTypeInfo;

const viewerRegistry: Viewer<any>[] = [];

export function registerViewer<P extends Product>(display: Viewer<P>) {
  viewerRegistry.push(display);
  viewerRegistry.sort((a, b) => b.weight - a.weight);
}

async function filterDisplays<D extends Display>(
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
