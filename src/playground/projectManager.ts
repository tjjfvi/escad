import { createEventEmitter, EventEmitter } from "../messaging/mod.ts";

export interface ProjectManager {
  getProjects: () => ProjectId[];
  getCurProject: () => ProjectId;
  setCurProject: (id: ProjectId) => void;
  createProject: () => void;
  deleteProject: (id: ProjectId) => void;
  renameProject: (id: ProjectId, name: string) => void;
  getCode: () => string;
  setCode: (value: string, fork?: boolean) => void;
  events: EventEmitter<{ codeChange: [value: string]; projectsChange: [] }>;
}

export interface ProjectManagerHost {
  initialProjectList: ProjectId[];
  setProjectList: (projectList: ProjectId[]) => void;
  getCode: (projectId: ProjectId) => string;
  setCode: (localProjectId: string, value: string) => void;
}

export function createProjectManager(host: ProjectManagerHost): ProjectManager {
  let projects = host.initialProjectList;
  let curProject = projects[0] ??= {
    type: "local",
    id: uuid(),
    name: "untitled",
  };
  let code = "";

  const events: ProjectManager["events"] = createEventEmitter();

  setCurProject(curProject);

  return {
    getProjects: () => projects,
    getCurProject: () => curProject,
    setCurProject,
    createProject,
    deleteProject,
    renameProject,
    getCode: () => code,
    setCode,
    events,
  };

  function setCode(value: string, fork = true) {
    code = value;
    if (projects[0] !== curProject) {
      projects.splice(projects.indexOf(curProject), 1);
      projects.unshift(curProject);
      if (curProject.type === "local") {
        onProjectsUpdate();
      }
    }
    events.emit("codeChange", code);
    if (curProject.type === "local") {
      host.setCode(curProject.id, code);
    } else if (fork) {
      let fork: ProjectId = {
        type: "local",
        id: uuid(),
        name: curProject.forkName,
      };
      projects.unshift(fork);
      onProjectsUpdate();
      host.setCode(fork.id, code);
      setCurProject(fork);
    }
  }

  function setCurProject(projectId: ProjectId) {
    curProject = projectId;
    onProjectsUpdate();
    code = host.getCode(curProject);
    events.emit("codeChange", code);
  }

  function deleteProject(projectId: ProjectId) {
    projects.splice(projects.indexOf(projectId), 1);
    if (projects.length === 0) {
      createProject();
    } else if (projectId === curProject) {
      setCurProject(projects[0]);
    } else {
      onProjectsUpdate();
    }
  }

  function createProject() {
    const projectId: ProjectId = {
      type: "local",
      id: uuid(),
      name: "untitled",
    };
    projects.unshift(projectId);
    setCurProject(projectId);
    onProjectsUpdate();
  }

  function onProjectsUpdate() {
    host.setProjectList(projects);
    events.emit("projectsChange");
  }

  function renameProject(projectId: ProjectId, name: string) {
    if (projectId.type === "remote") {
      throw new Error("Can only rename local projects");
    }
    projectId.name = name;
    onProjectsUpdate();
  }
}

export type ProjectId =
  | { type: "local"; id: string; name: string }
  | { type: "remote"; url: string; name: string; forkName: string };

function uuid() {
  // @ts-ignore
  return crypto.randomUUID();
}
