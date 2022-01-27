
list:
  just --summary

run-playground:
  deno run -A --unstable --no-check src/playground/devServer.ts

build-escad-run:
  PROD=1 just run-playground
  mkdir escad.run
  cp -r src/playground/static/* escad.run/
  mv escad.run/transpiled/https://escad.dev/playground/mod.js escad.run/main.js
  mv escad.run/transpiled/https://escad.dev/playground/sw.js escad.run/sw.js
  git rev-parse HEAD > escad.run/version

build-escad-dev:
  mkdir escad.dev
  cp -r src/* logo examples escad.dev
