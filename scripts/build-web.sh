#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cargo build --locked --release -p openclaim-wasm --target wasm32-unknown-unknown
mkdir -p web/pkg
wasm-bindgen target/wasm32-unknown-unknown/release/openclaim_wasm.wasm --target web --out-dir web/pkg
mkdir -p dist/skill
cp web/index.html web/style.css web/app.js web/public-tools.js web/vault.js dist/
cp -R web/pkg dist/
cp -R skills/openclaim/. dist/skill/
cp LICENSE dist/LICENSE
touch dist/.nojekyll
printf 'Browser distribution: %s/dist\n' "$PWD"
