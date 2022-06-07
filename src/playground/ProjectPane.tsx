/** @jsxImportSource solid */
// @style "./stylus/ProjectPane.styl"
import { createEffect, createSignal, For, onCleanup } from "../deps/solid.ts";
import { Pane } from "../client/Pane.tsx";
import { ProjectId, ProjectManager } from "./projectManager.ts";

export const ProjectPane = (props: { projectManager: ProjectManager }) => {
  const [projects, setProjects] = createSignal<ProjectId[]>(
    props.projectManager.getProjects(),
    {
      equals: false,
    },
  );
  const [curProject, setCurProject] = createSignal<ProjectId>(
    props.projectManager.getCurProject(),
  );
  createEffect(() => {
    onCleanup(
      props.projectManager.events.on(
        "projectsChange",
        () => {
          setProjects(props.projectManager.getProjects());
          setCurProject(props.projectManager.getCurProject());
        },
      ),
    );
  });
  return (
    <Pane
      name="Projects"
      class="ProjectPane"
      side="left"
      defaultWidth={300}
      resizable={false}
      defaultOpen={false}
    >
      <For each={projects()}>
        {(project) => {
          const isSelected = () => project === curProject();
          const titleEditable = () => isSelected() && project.type === "local";
          return (
            <input
              class="row"
              classList={{ selected: isSelected() }}
              readOnly={!titleEditable()}
              value={project.name}
              onChange={(e) =>
                props.projectManager.renameProject(
                  project,
                  e.currentTarget.value,
                )}
              onContextMenu={(e) => {
                e.preventDefault();
                props.projectManager.deleteProject(project);
              }}
              onFocus={(e) => {
                if (!isSelected()) {
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => {
                if (!isSelected()) {
                  e.preventDefault();
                  props.projectManager.setCurProject(project);
                }
              }}
            />
          );
        }}
      </For>
      <div
        class="row new"
        onClick={() => {
          props.projectManager.createProject();
        }}
      >
        new
      </div>
    </Pane>
  );
};
