/** @jsxImportSource solid */
// @style "./stylus/LogsPane.styl"
import { IdView } from "./IdView.tsx";
import { ArtifactManager, Hash, Id, Log } from "../core/mod.ts";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";
import {
  createEffect,
  createSignal,
  For,
  JSX,
  onCleanup,
  Show,
} from "../deps/solid.ts";
import { Loading } from "./Loading.tsx";
import { fetchArtifact } from "./fetchArtifact.ts";
import { MemoShow } from "./MemoShow.tsx";

export interface LogsPaneProps {
  artifactManager: ArtifactManager;
  messenger: ClientServerMessenger;
}

export const LogsPane = (props: LogsPaneProps) => {
  const [logs, setLogs] = createSignal<Hash<Log>[]>([], { equals: false });
  createEffect(() =>
    onCleanup(props.messenger.on("log", (log) => {
      if (!log) setLogs([]);
      else {
        setLogs((logs) => {
          logs.push(log);
          return logs;
        });
      }
    }))
  );
  return (
    <div class="LogsPane">
      <For each={logs()}>
        {(logHash) => (
          <LogView artifactManager={props.artifactManager} logHash={logHash} />
        )}
      </For>
      <div />
    </div>
  );
};

export interface LogTypeRegistration<T extends Log> {
  id: T["type"];
  class?: string;
  component: (props: { log: T }) => JSX.Element | null;
}

const logTypeRegistrations = new Map<Id, LogTypeRegistration<any>>();

export const registerLogType = async <T extends Log>(
  registration: LogTypeRegistration<T>,
) => {
  if (logTypeRegistrations.has(registration.id)) {
    throw new Error(`Duplicate LogTypeRegistration for id ${registration.id}`);
  }
  logTypeRegistrations.set(registration.id, registration);
};

interface LogViewProps {
  artifactManager: ArtifactManager;
  logHash: Hash<Log>;
}
const LogView = (props: LogViewProps) => {
  const log = fetchArtifact(props.artifactManager, () => props.logHash);
  return (
    <MemoShow
      when={log()}
      fallback={
        <div class="Log loading">
          <Loading />
        </div>
      }
    >
      {(log) => (
        <Show
          when={logTypeRegistrations.get(log().type)}
          fallback={
            <div class="Log none">
              <span>Cannot display log</span>
              <IdView id={log().type} />
            </div>
          }
        >
          {(registration) => (
            <div class={"Log " + (registration.class ?? "")}>
              <registration.component log={log()} />
            </div>
          )}
        </Show>
      )}
    </MemoShow>
  );
};
