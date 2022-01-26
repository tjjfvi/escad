
list:
  just --summary

run-playground:
  deno run -A --unstable --no-check src/playground/devServer.ts

build-playground:
  PROD=1 just run-playground
  mkdir playground
  mv src/playground/static/transpiled playground/
  cp src/playground/static/* playground/
  mv playground/transpiled/https://escad.dev/playground/mod.js playground/main.js
  mv playground/transpiled/https://escad.dev/playground/sw.js playground/sw.js
  cp -r src/* playground/
  git rev-parse HEAD > playground/version
