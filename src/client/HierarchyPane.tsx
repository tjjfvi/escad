/** @jsxImportSource solid */
// @style "./stylus/HierarchyPane.styl"
import { ArtifactManager, Hash, Hierarchy, Product } from "../core/mod.ts";
import {
  createEffect,
  createMemo,
  createSignal,
  Setter,
  Show,
} from "../deps/solid.ts";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";
import {
  HierarchyView,
  httDetailedEngine,
  httOutlineEngine,
  NestableSpan,
  SelectableComponent,
} from "./HierarchyView/mod.ts";
import { Dropdown } from "./Dropdown.tsx";
import { Loading } from "./Loading.tsx";
import { fetchArtifact } from "./fetchArtifact.ts";
import { getHierarchyPath } from "./HierarchyPath.ts";
import {
  HierarchySelection,
  resolveHierarchySelection,
} from "./HierarchySelection.ts";

export interface HierarchyPaneProps {
  artifactManager: ArtifactManager;
  messenger: ClientServerMessenger;
  hierarchyHash: Hash<Hierarchy> | null;
  setProductHashes: Setter<Hash<Product>[] | undefined>;
}

export const HierarchyPane = (props: HierarchyPaneProps) => {
  const [engine, setEngine] = createSignal(httOutlineEngine);
  const [selection, setSelection] = createSignal<HierarchySelection>([
    { path: [], type: "include" },
  ]);
  const hierarchySig = fetchArtifact(
    props.artifactManager,
    () => props.hierarchyHash,
  );
  const resolvedSelectionSig = createMemo(() => {
    const hierarchy = hierarchySig();
    if (!hierarchy) return null;
    return resolveHierarchySelection(selection(), hierarchy);
  });
  createEffect(() => {
    const resolvedSelection = resolvedSelectionSig();
    if (!resolvedSelection) {
      props.setProductHashes(undefined);
      return;
    }
    const hashes = [];
    for (const [hash, include] of resolvedSelection) {
      if (include) hashes.push(hash);
    }
    props.setProductHashes(hashes);
  });
  return (
    <Show when={!hierarchySig.loading} fallback={<Loading />}>
      <Show when={hierarchySig()} fallback={null}>
        <div class="HierarchyPane">
          <Dropdown
            value={engine()}
            setValue={setEngine}
            options={{
              "Outline": httOutlineEngine,
              "Detailed": httDetailedEngine,
            }}
          />
          <HierarchyView
            hierarchy={hierarchySig()!}
            engine={engine()}
            Selectable={Selectable}
          />
        </div>
      </Show>
    </Show>
  );

  function Selectable(props: Parameters<SelectableComponent>[0]) {
    return (
      <NestableSpan
        class={"selectable " + getSelectionClass()}
        onClick={(event) => {
          if (event.ctrlKey || event.metaKey || event.altKey) {
            setSelection((x) => [
              ...x,
              {
                type: event.altKey ? "exclude" : "include",
                path: props.path,
              },
            ]);
          } else {
            setSelection([{
              type: "include",
              path: props.path,
            }]);
          }
        }}
        children={props.children}
      />
    );

    function getSelectionClass() {
      const { path } = props;
      const hierarchy = hierarchySig();
      if (!hierarchy) return "";
      const linkedProducts = getHierarchyPath(path, hierarchy)
        ?.linkedProducts;
      if (!linkedProducts) return;
      const resolvedSelection = resolvedSelectionSig();
      if (!resolvedSelection) return;
      const selectionStates = linkedProducts.map((x) =>
        resolvedSelection.get(x)
      );
      const directly = selection().findLast((x) => Hash.equal(x.path, path))
        ?.type ?? null;
      const someNull = selectionStates.some((x) => x == null);
      const included = selectionStates.some((x) => x === true);
      const excluded = selectionStates.some((x) => x === false);
      return `directly-${directly} someNull-${someNull} included-${included} excluded-${excluded}`;
    }
  }
};
