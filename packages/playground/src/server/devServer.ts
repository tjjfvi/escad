
import { compiler, staticDir } from "./bundler";

compiler.watch({ ignored: /node_modules/ }, err => {
  if(err) console.error(err);
  else console.log("Bundled")
});

import express = require("express");

const app = express();

app.use(express.static(staticDir));

app.listen(8000)
