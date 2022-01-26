
list:
  just --summary

run-playground:
  deno run -A --unstable --no-check src/playground/devServer.ts

build-playground:
  PROD=1 just run-playground
  mkdir playground
  mv src/playground/static/*: playground/
  cp src/playground/static/* playground/
  mv playground/file:/$PWD/src/playground/mod.js playground/main.js
  mv playground/file:/$PWD/src/playground/sw.js playground/sw.js
  cp -r src/* playground/
