
list:
  @just --list

fmt:
  deno fmt --config deno.jsonc

fmt-check:
  deno fmt --config deno.jsonc --check

lint:
  @just fmt
  deno lint --config deno.jsonc

lint-check:
  @just fmt-check
  deno lint --config deno.jsonc

check:
  @just lint-check
  deno cache --config deno.jsonc --no-check=remote --import-map src/deps/_/solid_jsx-runtime_import_map.json src/*/mod.ts src/*/client-plugin/mod.ts src/playground/main.tsx

check-force:
  @just lint-check
  deno cache --config deno.jsonc --no-check=remote --import-map src/deps/_/solid_jsx-runtime_import_map.json --reload src/*/mod.ts src/*/client-plugin/mod.ts src/playground/main.tsx

test:
  deno test -A --unstable

test-update:
  deno test -A --unstable -- --update

run-playground:
  deno run -A --unstable --no-check src/playground/devServer.ts

build-escad-run:
  PROD=1 just run-playground
  mkdir escad.run
  cp -r src/playground/static/* escad.run/
  mv escad.run/transpiled/https://escad.dev/playground/main.js escad.run/
  mv escad.run/transpiled/https://escad.dev/playground/sw.js escad.run/
  git rev-parse HEAD > escad.run/version

build-escad-dev:
  mkdir escad.dev
  cp -r src/* logo examples escad.dev

serve file:
  deno run -A --unstable --no-check src/cli/start.ts {{file}}

moderate:
  @deno run -A https://deno.land/x/moderate@0.0.5/mod.ts
