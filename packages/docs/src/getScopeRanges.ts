
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

export async function getScopeRanges(source: string, path: string){
  const grammar = await registry.loadGrammar(`source.${path.split(".").slice(-1)}`)
  if(!grammar) throw new Error("Missing grammar")
  const lines = source.split("\n")
  const ranges: Ranges = []
  let ruleStack = INITIAL
  let totalIndex = 0
  for(const line of lines) {
    const lineTokens = grammar.tokenizeLine(line, ruleStack)
    for(const token of lineTokens.tokens) {
      const { startIndex, endIndex, scopes } = token
      ranges.push({
        start: totalIndex + startIndex,
        end: totalIndex + endIndex,
        info: [{
          type: "ScopeRangeInfo",
          scopes,
        }],
      })
    }
    ruleStack = lineTokens.ruleStack
    totalIndex += line.length + 1
  }
  return ranges
}
