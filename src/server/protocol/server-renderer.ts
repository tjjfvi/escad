import {
  ExportTypeInfo,
  Hash,
  Hierarchy,
  Log,
  ObjectParam,
  ObjectParamValue,
  Product,
} from "../../core/mod.ts";
import { Messenger } from "../../messaging/mod.ts";

export interface LoadFileInfo {
  paramDef: ObjectParam<any>;
  exportTypes: readonly ExportTypeInfo[];
  clientPlugins: readonly string[];
  func: Function | ((params: ObjectParamValue<any>) => any);
}

export interface RenderInfo {
  products: readonly Hash<Product>[];
  hierarchy: Hash<Hierarchy> | null;
  paramDef: Hash<ObjectParam<any>> | null;
  exportTypes: readonly ExportTypeInfo[];
  clientPlugins: readonly string[];
}

export type RendererServerShape = {
  run(params?: unknown): Promise<RenderInfo>;
  loadFile(): Promise<LoadFileInfo>;
  lookupRef(loc: readonly Hash<unknown>[]): Promise<Hash<unknown>>;
};

export type ServerRendererEvents = {
  log: [log: Hash<Log> | null];
  renderStart: [];
  renderFinish: [];
};

export type ServerRendererShape = {
  lookupRaw(hash: Hash<unknown>): Promise<readonly Uint8Array[] | null>;
};

export type ServerRendererMessenger = Messenger<
  ServerRendererShape,
  RendererServerShape,
  ServerRendererEvents
>;
export type RendererServerMessenger = Messenger<
  RendererServerShape,
  ServerRendererShape,
  ServerRendererEvents
>;
