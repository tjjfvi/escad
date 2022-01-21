
import fs from "fs"
import { Hash } from "@escad/core"
import { promisify } from "util"

export const createResourceFile = (source: string, extension = ".js") => {
  const path = getResourceFilePath(source, extension)
  fs.writeFileSync(path, source)
  return path
}

const writeFile = promisify(fs.writeFile)
export const createResourceFileAsync = async (source: string, extension = ".js") => {
  console.log(source)
  const path = getResourceFilePath(source, extension)
  await writeFile(path, source)
  return path
}

export const getResourceFilePath = (source: string, extension = ".js") =>
  `/resourceFiles/${Hash.create(source)}${extension}`
