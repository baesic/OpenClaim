# Installation

## Native MCP

Build from source or obtain the corresponding release archive. Available release targets are Linux x86_64 (GNU), macOS Apple Silicon and Windows x86_64. Other architectures can build from source; compatibility must be tested on the intended platform. Release checksums detect accidental changes but are not an independent signature or security audit.

Unpack the archive. Point an MCP-capable local client at the executable using [the configuration example](../examples/mcp-config.json). There is no API key, LLM account or background service requirement for stdio. Stop the child process through your client when done.

### Optional loopback HTTP

Set `OPENCLAIM_MCP_TOKEN` to a random secret of at least 32 ASCII letters/digits/`-_.`, then run `openclaim-mcp --http`. For example, in a shell supporting command substitution:

```sh
export OPENCLAIM_MCP_TOKEN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
openclaim-mcp --http
```

Connect a **local non-browser client** to `http://127.0.0.1:31415/mcp` with `Authorization: Bearer <your local token>`. Configure the actual secret through the client's supported secret mechanism. The server does not print the secret. Do not place it in URLs, git or issues. Host must be `127.0.0.1:31415`; any browser `Origin` is refused. There is no CORS permission and no remote bind option. This mode is optional; stdio is simpler.

## Browser

Build with `bash scripts/build-web.sh`, then run `python3 scripts/serve-web.py`. This is a loopback-only static server with no request logging, directory listing or data API. Open `http://127.0.0.1:4173`.

Alternatively unpack the browser release and serve its directory with a trusted static server bound to loopback. Never use a cloud workspace or external server for private processing. The distributed JS/WASM must load before you disconnect the network. There is currently no service-worker install/offline cache; reloading without access to the static files may fail.

WebMCP requires a supporting browser/agent and may require experimental browser settings. OpenClaim only detects the API and does not change browser security settings. Normal manual use needs no WebMCP support. The UI reports whether public tools were registered.

## Skill

Copy the entire `skills/openclaim` directory into the host's supported skills directory. It is independent of the MCP server. Skill references travel with it. Private values must be filled outside cloud chat; a skill is guidance, not an enforcement sandbox.

## Storage and uninstall

By default, closing the tab discards in-memory drafts. Manually saved plaintext drafts and encrypted backups remain on the user's PC. To remove the software, remove its executable/configuration and Skill directory, close browser tabs and delete unwanted exports yourself. OpenClaim cannot erase browser/OS memory snapshots, cloud chat history, downloaded files or backups held by other software.
