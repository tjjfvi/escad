import { createServer } from "./server.ts";
import * as path from "https://deno.land/std@0.122.0/path/mod.ts";

createServer({
  artifactsDir: path.join(Deno.cwd(), "artifacts"),
  port: 8080,
  ip: "::",
  loadFile: path.join(Deno.cwd(), Deno.args[0]),
  loadDir: null!,
  dev: true,
});
