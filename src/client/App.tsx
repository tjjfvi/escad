/** @jsxImportSource solid */
import {
  ArtifactManager,
  ConversionRegistry,
  Hash,
  Product,
} from "../core/mod.ts";
import {
  createEffect,
  createSignal,
  onCleanup,
  untrack,
} from "../deps/solid.ts";
import {
  ClientServerMessenger,
  RenderInfo,
} from "../server/protocol/server-client.ts";
import { DisplayPane } from "./DisplayPane.tsx";
import { HierarchyPane } from "./HierarchyPane.tsx";
import { LogsPane } from "./LogsPane.tsx";
import { Pane } from "./Pane.tsx";
import { ParametersPane } from "./ParametersPane.tsx";
import { Status, Statuses } from "./Status.tsx";

interface AppProps {
  conversionRegistry: ConversionRegistry;
  artifactManager: ArtifactManager;
  messenger: ClientServerMessenger;
  statuses: Status[];
}

export const App = (props: AppProps) => {
  const [params, setParams] = createSignal<Record<string, any> | null>(null);
  const [info, setInfo] = createSignal<RenderInfo>();
  createEffect(() => {
    onCleanup(props.messenger.on("info", setInfo));
    onCleanup(props.messenger.on("changeObserved", () => {
      props.messenger.run(untrack(params));
    }));
  });
  createEffect(() => {
    props.messenger.run(params());
  });
  const [productHashes, setProductHashes] = createSignal<Hash<Product>[]>();
  return (
    <>
      <Pane side="left" name="Parameters">
        <ParametersPane
          artifactManager={props.artifactManager}
          paramDefHash={info()?.paramDef ?? null}
          params={params()}
          setParams={setParams}
        />
      </Pane>
      <DisplayPane
        conversionRegistry={props.conversionRegistry}
        artifactManager={props.artifactManager}
        productHashes={productHashes()}
        exportTypes={info()?.exportTypes ?? []}
      />
      <Pane side="right" name="Hierarchy">
        <HierarchyPane
          artifactManager={props.artifactManager}
          messenger={props.messenger}
          hierarchyHash={info()?.hierarchy ?? null}
          setProductHashes={setProductHashes}
        />
      </Pane>
      <Pane side="right" name="Logs">
        <LogsPane
          artifactManager={props.artifactManager}
          messenger={props.messenger}
        />
      </Pane>
      <Statuses
        statuses={props.statuses}
      />
    </>
  );
};
