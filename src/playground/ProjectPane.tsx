// @style "./stylus/ProjectPane.styl"

import React from "../deps/react.ts";
import { Pane } from "../client/Pane.tsx";
import { ProjectManager } from "./projectManager.ts";

export const ProjectPane = (
  { projectManager }: { projectManager: ProjectManager },
) => {
  let [, setState] = React.useState({});
  React.useEffect(() => {
    return projectManager.events.on("projectsChange", () => setState({}));
  }, []);
  return (
    <Pane
      name="Projects"
      left
      defaultWidth={300}
      resizable={false}
      defaultOpen={false}
    >
      {projectManager.getProjects().map((project) => {
        const isSelected = project === projectManager.getCurProject();
        const titleEditable = isSelected && project.type === "local";
        return (
          <input
            key={project.type === "local" ? project.id : project.url}
            className={isSelected ? "selected row" : "row"}
            readOnly={!titleEditable}
            value={project.name}
            onChange={(e) =>
              projectManager.renameProject(project, e.target.value)}
            onAuxClick={() => projectManager.deleteProject(project)}
            onClick={(e) => {
              if (!isSelected) {
                e.preventDefault();
                projectManager.setCurProject(project);
              }
            }}
          />
        );
      })}
      <div
        onClick={() => {
          projectManager.createProject();
        }}
        className="row new"
      >
        new
      </div>
    </Pane>
  );
};
