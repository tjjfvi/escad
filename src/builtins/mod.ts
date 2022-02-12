import { pickChainables } from "../core/mod.ts";
import { registerClientPlugin } from "../server/registerClientPlugin.ts";

registerClientPlugin(
  new URL("./client-plugin/mod.ts", import.meta.url).toString(),
);

import * as _chainables from "./chainables/mod.ts";

export default pickChainables(_chainables);

// moderate --exclude register.ts --exclude helpers.ts --exclude client-plugin

export * from "./chainables/mod.ts";
export * from "./serializers/mod.ts";
export * from "./BoundingBox.ts";
export * from "./Bsp.ts";
export * from "./Face.ts";
export * from "./Matrix4.ts";
export * from "./Mesh.ts";
export * from "./Plane.ts";
export * from "./Transformation.ts";
export * from "./Vector3.ts";
export * from "./bspMeshConversion.ts";
export * from "./smoothContext.ts";
export * from "./stl.ts";
