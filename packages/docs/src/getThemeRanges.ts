
import { INITIAL, parseRawGrammar, Registry } from "vscode-textmate"
import { loadWASM, OnigScanner, OnigString } from "vscode-oniguruma"
import fetch from "node-fetch"
import fs from "fs-extra"
import { Ranges } from "./Range"

const registry = new Registry({
  // @ts-ignore Type mismatch between vscode-onigurama and vscode-textmate
  onigLib: (async () => {
    const wasmBin = await fs.readFile(require.resolve("vscode-oniguruma/release/onig.wasm"))
    await loadWASM(wasmBin.buffer)
    return {
      createOnigScanner: (patterns: string[]) => new OnigScanner(patterns),
      createOnigString: (content: string) => new OnigString(content),
    }
  })(),
  loadGrammar: async scopeName => {
    const tstmVersion = "v0.0.55"
    const tstmBasePath = `https://github.com/microsoft/TypeScript-TmLanguage/raw/${tstmVersion}`
    if(scopeName === "source.ts")
      return await fetchGrammar(`${tstmBasePath}/TypeScript.tmLanguage`)
    if(scopeName === "source.tsx")
      return await fetchGrammar(`${tstmBasePath}/TypeScriptReact.tmLanguage`)
  },
})

async function fetchGrammar(url: string){
  const source = await fetch(url).then(r => r.text())
  const grammar = parseRawGrammar(source, url)
  return grammar
}

const themePromise = fs.readFile(require.resolve("../themes/default.json"), "utf8").then(source => {
  const theme = JSON.parse(source)
  registry.setTheme(theme)
})

export async function getThemeRanges(source: string, path: string){
  await themePromise
  const grammar = await registry.loadGrammar(`source.${path.split(".").slice(-1)}`)
  if(!grammar) throw new Error("Missing grammar")
  const lines = source.split("\n")
  const ranges: Ranges = []
  let ruleStack = INITIAL
  let totalIndex = 0
  const colorMap = registry.getColorMap()
  for(const line of lines) {
    const lineTokens = grammar.tokenizeLine(line, ruleStack)
    for(const token of lineTokens.tokens) {
      const { startIndex, endIndex, scopes } = token
      const themeData =
        scopes
          .slice()
          .reverse()
          .flatMap(s => (grammar as any).getMetadataForScope(s).themeData)
          .filter(x => !x.parentScopes || x.parentScopes.every((y: string) => scopes.includes(y)))
          .reduce((a, b) => ({
            fontStyle: a.fontStyle === -1 ? b.fontStyle : a.fontStyle,
            foreground: a.foreground || b.foreground,
            background: a.background || b.background,
          }))
      const fontStyle: number = themeData.fontStyle === -1 ? 0 : themeData.fontStyle
      const foreground: number = themeData.foreground
      const background: number = themeData.background
      ranges.push({
        start: totalIndex + startIndex,
        end: totalIndex + endIndex,
        info: [{
          type: "ThemeRangeInfo",
          foreground: colorMap[foreground],
          background: colorMap[background],
          italic: !!(fontStyle & 1),
          bold: !!(fontStyle & 2),
          underline: !!(fontStyle & 4),
        }],
      })
    }
    ruleStack = lineTokens.ruleStack
    totalIndex += line.length + 1
  }
  return ranges
}
