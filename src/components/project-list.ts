import { Component } from "./base-component";
import { Autobind } from "../decorators/autobind";
import { DragTarget } from "../models/drag-drop-interfaces";
import { Project, ProjectStatus } from "../models/project-model";
import { ProjectItem } from "./project-item";
import { projectState } from "../state/project-state";

// ProjectList class
export class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listElem = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElem.innerHTML = "";
    for (const pItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, pItem);
    }
  }

  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    const pId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      pId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter(p => {
        if (this.type === "active") {
          return p.status === ProjectStatus.Active;
        } else {
          return p.status === ProjectStatus.Finished;
        }
      });
      this.assignedProjects = relevantProject;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}
// end ProjectList
