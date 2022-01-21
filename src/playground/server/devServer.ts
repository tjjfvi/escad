import { compiler, staticDir } from "./bundler.ts";
import { join } from "path.ts";
import express from "express.ts";
import fs from "fs-extra.ts";

compiler.watch({ ignored: /node_modules/ }, (err) => {
  if (err) console.error(err);
  else console.log("Bundled");
});

const app = express();

app.use(express.static(staticDir));
app.use("/static/", express.static(staticDir));

app.use(express.json({ limit: "32mb" }));

app.post("/create", async (req, res) => {
  const { url, renderer, client } = req.body;

  const files = {
    "info.json": JSON.stringify({ url }),
    "renderer.bundle.js": renderer,
    "client.bundle.js": client,
  };

  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      await fs.writeFile(join(staticDir, "run", name), content);
    }),
  );

  res.status(200);
  res.end(JSON.stringify({
    url: "/run",
    short: "run",
  }));
});

app.listen(8000);
