
import fs from "fs";
import { hash } from "@escad/core";

export const createResourceFile = (source: string, extension = ".js") => {
  const path = getResourceFilePath(source, extension);
  fs.writeFileSync(path, source);
  return path
}

export const getResourceFilePath = (source: string, extension = ".js") =>
  `/resourceFiles/${hash(source)}${extension}`
