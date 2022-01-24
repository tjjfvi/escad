import { createServer } from "./server.ts";
import * as path from "../deps/path.ts";

createServer({
  artifactsDir: path.join(Deno.cwd(), "artifacts"),
  port: 8080,
  ip: "::",
  loadFile: path.join(Deno.cwd(), Deno.args[0]),
  loadDir: null!,
  dev: true,
});
