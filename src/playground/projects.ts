import { computed, Observable, observable, writeable } from "../deps/rhobo.ts";
import { escadLocation } from "./escadLocation.ts";
import { clientId, put } from "./swApi.ts";
import { transpiler } from "./transpiler.ts";

const initialCode = `
import escad from "${escadLocation}/core/mod.ts";
import "${escadLocation}/builtins/register.ts";

export default () =>
  escad
    .cube({ size: 1 })
    .sub(escad.cube({ size: .9 }))
    .sub(escad.cube({ size: 1, shift: 1 }))
`;

export interface Project {
  id: string;
  name: Observable<string>;
  code: Observable<string>;
}

const projectIds = localStorageObservableJson<string[]>(
  "projectIds",
  () => [uuid()],
);

export const projects = observable<Project[]>(
  projectIds.value.map((id) => project(id)),
);

export const curProjectInd = observable(0);

let isHash = await parseHash();

curProjectInd.on("update", () => {
  clearHash();
});

projects.on("update", () => {
  projectIds(projects.value.map((x) => x.id));
});

export const curProject = computed<Project>(() => projects()[curProjectInd()]);

export const code = writeable(
  () => curProject().code(),
  (x) => {
    curProject().code(x);
    commitHash();
    if (curProjectInd.value !== 0) {
      projects([
        curProject.value,
        ...projects.value.filter((x) => x !== curProject.value),
      ]);
      curProjectInd(0);
    }
  },
);

await onCodeChange();

code.on("update", () => onCodeChange());

export function newProject() {
  curProjectInd(0);
  projects([project(uuid()), ...projects()]);
}

export function deleteProject(i: number) {
  if (projects().length === 1) {
    projects([project(uuid())]);
  } else {
    let ind = curProjectInd();
    curProjectInd(ind === i ? 0 : ind > i ? ind - 1 : ind);
    projects(projects().filter((_, j) => i !== j));
  }
}

function localStorageObservable(key: string, defaultValue: () => string) {
  const obs = observable(localStorage.getItem(key) ?? defaultValue());
  obs.on("update", () => {
    localStorage.setItem(key, obs.value);
  });
  return obs;
}

function localStorageObservableJson<T>(
  key: string,
  defaultValue: () => T,
): Observable<T> {
  const obs = localStorageObservable(key, () => JSON.stringify(defaultValue()));
  return writeable(
    () => JSON.parse(obs()),
    (v) => obs(JSON.stringify(v)),
  );
}

function uuid(): string {
  // @ts-ignore
  return crypto.randomUUID();
}

function project(
  id: string,
  defaultName = `untitled-${id.slice(0, 6)}`,
  defaultCode = initialCode,
): Project {
  return {
    id,
    name: localStorageObservable(
      `project-${id}-name`,
      () => defaultName,
    ),
    code: localStorageObservable(`project-${id}-code`, () => defaultCode),
  };
}
true;

async function onCodeChange() {
  await put(`${clientId}/main.ts`, code.value);
  await transpiler.transpile(
    new URL(`/${clientId}/main.ts`, import.meta.url).toString(),
    true,
  );
}

export async function share() {
  const response = await fetch("https://api.escad.run/create", {
    method: "POST",
    body: JSON.stringify({
      code: code(),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error(response);
    return null;
  }
  const { short } = await response.json() as { short: string };
  window.location;
  history.pushState({}, "Playground", "#" + short);
  return window.location.toString();
}

async function parseHash() {
  if (window.location.hash) {
    let hash = window.location.hash.slice(1);
    let response = await fetch(
      `https://api.escad.run/${hash}.ts`,
    );
    if (response.ok) {
      let content = await response.text();
      projects([project(uuid(), "escad.run/#" + hash, content), ...projects()]);
      return true;
    }
  }
  return false;
}

function commitHash() {
  if (!isHash) return;
  isHash = false;
  projects.emit("update");
  curProject.value.name(
    window.location.hash.slice(1) + "-fork-" + curProject.value.id.slice(0, 6),
  );
  window.history.pushState({}, "Playground", "/");
}

function clearHash() {
  if (!isHash) return;
  isHash = false;
  projects(projects().slice(1));
  window.history.pushState({}, "Playground", "/");
  curProjectInd(curProjectInd.value - 1);
}
