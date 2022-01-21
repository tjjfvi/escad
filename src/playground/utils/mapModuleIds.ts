import { Compiler, Module } from "webpack.ts"

export const mapModuleIds = (fn: (id: string, module: Module) => string) => (compiler: Compiler) => {
  const context = compiler.options.context
  if(!context) throw new Error("Missing context in compiler options")

  compiler.hooks.compilation.tap("ChangeModuleIdsPlugin", compilation => {
    compilation.hooks.beforeModuleIds.tap("ChangeModuleIdsPlugin", modules => {
      const chunkGraph = compilation.chunkGraph
      if(!chunkGraph) throw new Error("missing chunkGraph on compilation")
      for(const module of modules)
        if(module.libIdent) {
          const origId = module.libIdent({ context })
          if(!origId) continue
          chunkGraph.setModuleId(module, fn(origId, module))
        }
    })
  })
}
