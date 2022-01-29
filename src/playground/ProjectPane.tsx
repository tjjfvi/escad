// @style "./stylus/ProjectPane.styl"

import React from "../deps/react.ts";
import { Pane } from "../client/Pane.tsx";
import {
  curProjectInd,
  deleteProject,
  newProject,
  projects,
} from "./projects.ts";
import { observer } from "../deps/rhobo.ts";

export const ProjectPane = observer(() => (
  <Pane
    name="Projects"
    left
    defaultWidth={300}
    resizable={false}
    defaultOpen={false}
  >
    {projects().map((project, i) => (
      i === curProjectInd()
        ? (
          <input
            key={project.id}
            className="selected row"
            value={project.name()}
            onChange={(e) => project.name(e.target.value)}
            onAuxClick={() => deleteProject(i)}
          />
        )
        : (
          <div
            key={project.id}
            className="row"
            onClick={() => {
              curProjectInd(i);
            }}
            onAuxClick={() => deleteProject(i)}
          >
            {project.name()}
          </div>
        )
    ))}
    <div
      onClick={() => {
        newProject();
      }}
      className="row new"
    >
      new
    </div>
  </Pane>
));
