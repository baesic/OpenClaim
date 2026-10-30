#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cargo build --locked --release -p openclaim-wasm --target wasm32-unknown-unknown
mkdir -p web/pkg
wasm-bindgen target/wasm32-unknown-unknown/release/openclaim_wasm.wasm --target web --out-dir web/pkg
rm -rf dist
mkdir -p dist/skill dist/examples dist/data
cp web/index.html web/browser.html web/workspace.html web/style.css web/app.js web/browser.js web/public-tools.js web/vault.js web/guidance-view.js dist/
cp -R web/pkg dist/
cp -R skills/openclaim/. dist/skill/
cp examples/mcp-config.json dist/examples/
cp data/kr-response-guide.json dist/data/
cp -R docs dist/
cp README.md SECURITY.md CONTRIBUTING.md dist/
cargo run --locked --quiet -p openclaim-mcp -- --describe > dist/service.json
tar -czf dist/openclaim-skill.tar.gz -C skills openclaim
cp LICENSE dist/LICENSE
touch dist/.nojekyll
printf 'Browser distribution: %s/dist\n' "$PWD"
