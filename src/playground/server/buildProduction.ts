import { compiler } from "./bundler.ts";

compiler.run((err) => {
  if (err) throw err;
  console.log("Bundled");
});
