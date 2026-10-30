# Installation and integration

Choose native MCP or browser WASM as a primary mode, or use the standalone Skill independently. The service page is a package/configuration directory. No mode requires entering personal information, opening the optional drafting tool or completing a fixed procedure.

## Native MCP — primary

Obtain the corresponding versioned release archive and verify it against that release's `SHA256SUMS`, or build from source. Available binaries: Linux x86_64 GNU, macOS Apple Silicon, Windows x86_64. Other architectures may build from source; test compatibility on the intended platform. Checksums detect accidental changes but are not an independent signature or security audit.

Unpack the archive. Point an MCP-capable local client at the executable with [the configuration example](../examples/mcp-config.json), replacing its command with the absolute local path. Windows uses `openclaim-mcp.exe`. Client-specific settings may differ. No API key, LLM account or hosted server is required for stdio. The client starts/stops the child process. Manually starting it without arguments waits for MCP input; this is expected.

For source installation, with Git and Rust 1.95.0:

```sh
git clone --branch dev/initial-build https://github.com/baesic/OpenClaim.git
cd OpenClaim
cargo build --locked --release -p openclaim-mcp
./target/release/openclaim-mcp --version
./target/release/openclaim-mcp --describe
```

`--describe` exports the actual public tool schemas and OpenClaim's distribution metadata. It does not install or launch a server in an Agent. Discover runtime tools using the client's MCP tool listing. See [SERVICE.md](SERVICE.md) for contracts and requests.

### Optional loopback HTTP

Set `OPENCLAIM_MCP_TOKEN` to a random secret of at least 32 ASCII letters/digits/`-_.`, then run `openclaim-mcp --http`. For example in a shell supporting command substitution:

```sh
export OPENCLAIM_MCP_TOKEN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
openclaim-mcp --http
```

A **local non-browser client** connects to `http://127.0.0.1:31415/mcp` with `Authorization: Bearer <your local token>`. Supply the actual secret through its supported secret mechanism; the server does not print it. Never place it in URLs, Git or issues. Host must be exactly `127.0.0.1:31415`; all `Origin` headers are refused. No CORS permission or remote bind exists. Prefer stdio when possible. A cloud client expecting an internet URL cannot connect through the service page.

## Browser WASM — primary

Download the browser archive and serve it with a trusted static server bound to loopback, or build from the repository:

```sh
cargo install wasm-bindgen-cli --version 0.2.121 --locked
bash scripts/build-web.sh
python3 scripts/serve-web.py
```

Build requires Rust, Python 3 and the matching wasm-bindgen CLI. The toolchain installs the WASM target. The build also compiles native MCP to export the actual schemas. Open `http://127.0.0.1:4173`. The supplied server serves `dist/` on loopback without request logs, directory listings or a data API.

- `index.html`: service directory with MCP downloads/configuration, Skill archive, tool catalogue and execution options. Static, no JavaScript dependency. The source version is readable with `file://`, but generated download files exist only after build/in a release.
- `browser.html`: public WASM response/blank-template tools and optional WebMCP, with no private fields.
- `workspace.html`: optional local draft/evidence hash/receipt note/encrypted export. No WebMCP registration. Use only if document preparation is wanted.

WebMCP needs a supporting browser/Agent and may need experimental browser settings. OpenClaim detects the API and does not change settings. The UI reports public tool registration; manual public tools work without WebMCP. It is not a remote MCP URL or a connection to the native HTTP server.

Private processing belongs on the user's device. Prefer a trusted loopback installation for private drafting; do not use a cloud workspace. The JS/WASM assets must load before disconnecting. No service-worker install/offline cache is included, so reload may fail if static files are unavailable.

## Standalone Skill — auxiliary, independent

Unpack `openclaim-skill.tar.gz` or copy the complete `skills/openclaim` directory into a skills path supported by the host. Include `SKILL.md`, `agents/` and every `references/` file. Follow the host's installation instructions. Installing the Skill does not install a native MCP server.

Ask the Agent for a public response option or blank template without providing victim data. The Skill uses bundled response knowledge directly, or MCP if available. The server, browser and service page are not prerequisites. Private values must be filled outside cloud chat; a Skill is guidance rather than an enforcement sandbox.

## Storage and uninstall

The service/public tools keep no private case storage. The optional workspace holds input in memory and discards it when cleared or closed. Explicit plaintext drafts and encrypted backups remain on the user's PC. Remove software/configuration/Skill directory, close tabs and delete unwanted exports yourself. OpenClaim cannot erase OS/browser snapshots, cloud chat history or copies held by other software.
