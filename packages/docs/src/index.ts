
import ts from "typescript"
import fs from "fs-extra"
import { getHoverRanges } from "./getHoverRanges"
import { getScopeRanges } from "./getScopeRanges"
import { getLineRanges } from "./getLineRanges"
import { intersectRanges } from "./intersectRanges"
import { Range } from "./Range"
import flatted from "flatted"
import { join, relative, dirname } from "path"

const outDir = join(__dirname, "../out/")
const rootDir = join(__dirname, "../../core/src/")
const rootFilePaths = [join(rootDir, "index.ts")]
const configFilePath = join(__dirname, "../../tsconfig.settings.json")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const options = ts.convertCompilerOptionsFromJson(require(configFilePath), configFilePath).options

const servicesHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => rootFilePaths,
  getScriptVersion: () => "0",
  getScriptSnapshot: fileName => {
    if(!fs.existsSync(fileName))
      return undefined

    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString())
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => options,
  getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
}

const ls = ts.createLanguageService(servicesHost, ts.createDocumentRegistry())

const program = ls.getProgram()

if(!program) throw new Error("no program")

program.getSourceFiles().map(async sourceFile => {
  const path = sourceFile.fileName
  if(!path.startsWith(rootDir))
    return
  const relativePath = relative(rootDir, path)
  const source = sourceFile.getText()
  const ranges = (await Promise.all([
    getHoverRanges(path, sourceFile, ls),
    getScopeRanges(source, path),
    getLineRanges(source),
    [{ start: 0, end: source.length, info: [] }],
  ])).reduce<Range[]>((a, b) => [...intersectRanges([...a], [...b])], [])
  const outPath = join(outDir, relativePath, "ranges.json")
  await fs.mkdirp(dirname(outPath))
  await fs.writeFile(outPath, flatted.stringify(ranges))
})
