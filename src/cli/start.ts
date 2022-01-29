import { createServer } from "./server.ts";
import * as path from "../deps/path.ts";

createServer({
  artifactsDir: path.join(Deno.cwd(), "artifacts"),
  port: 8046,
  ip: "::",
  loadFile: "file://" + path.join(Deno.cwd(), Deno.args[0]),
  loadDir: null!,
  dev: true,
});
