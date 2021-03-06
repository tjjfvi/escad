
import fs from "fs";
import { Hash } from "@escad/core";

export const createResourceFile = (source: string, extension = ".js") => {
  const path = getResourceFilePath(source, extension);
  fs.writeFileSync(path, source);
  return path
}

export const getResourceFilePath = (source: string, extension = ".js") =>
  `/resourceFiles/${Hash.create(source)}${extension}`
