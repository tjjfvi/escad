
import { ExportType } from "./ExportType"
import { artifactManager, ArtifactManager } from "./ArtifactManager";

export class ExportTypeRegistry {

  private registered = new Set<ExportType<any>>();

  constructor(public artifactManager: ArtifactManager){}

  register(exportType: ExportType<any>){
    this.registered.add(exportType);
    this.artifactManager.artifactStores.push(exportType.store);
  }

  listRegistered(): Iterable<ExportType<any>>{
    return this.registered;
  }

}

export const exportTypeRegistry = new ExportTypeRegistry(artifactManager);
