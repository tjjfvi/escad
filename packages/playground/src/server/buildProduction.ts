import { compiler } from "./bundler"

compiler.run(err => {
  if(err) throw err
  console.log("Bundled")
})
