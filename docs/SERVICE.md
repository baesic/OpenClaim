# Service, distribution and Agent contract

OpenClaim's product is a Rust MCP server, a browser WASM execution mode and a standalone Skill package providing response knowledge for a user's own privacy-breach claim preparation. Native MCP and browser WASM are primary modes; standalone Skill is an independent auxiliary mode. A service page is included to distribute and explain these tools. It is not a project-operated claim intake website.

## Surfaces and responsibility

| Surface | Purpose | Runtime | Private input | AI tool registration |
|---|---|---|---|---|
| `index.html` | Installation, packages, configuration, tool directory, mode selection | Static HTML/CSS, no script or WASM dependency | None | None |
| Native `openclaim-mcp` | Agent tool service installed by the user | User PC, stdio or authenticated loopback HTTP | None | Four public MCP tools |
| `browser.html` | Public WASM tools and optional WebMCP | User browser | None | Same four public functions via WebMCP when supported |
| `skill/` | Instructions, response knowledge and blank templates | User-selected Agent environment | None requested | Uses MCP if available; works independently otherwise |
| `workspace.html` | Optional local document preparation | User browser / Rust WASM | User-operated local input | None; no WebMCP registration |

The service entry does not require a JavaScript runtime, MCP installation, or entering case data. The browser entry does not force document preparation. Skill-only use does not require visiting any page. User choices select capabilities; there is no mandatory case progression. All actual queries, identity checks, submissions and settlements belong to the user.

## Install and discover

Download a versioned native release, verify its checksum, unpack and configure the absolute binary path in a local MCP client. See [INSTALL.md](INSTALL.md) and [configuration example](../examples/mcp-config.json). The process waits for MCP messages on stdio when invoked without arguments. An HTTP client must run locally and supply the configured bearer secret. No public endpoint or cloud service account exists.

Use MCP `tools/list` to discover the actual runtime contract. The native CLI `openclaim-mcp --describe` exports `openclaim-service/v1`, containing release version, installation modes, real MCP router tool definitions, public guidance selectors and privacy boundaries. The build includes it as `service.json`. This is an OpenClaim-specific distribution description, **not** a standard MCP server registry file, automated installer, or compliance assertion. Descriptors do not execute code or install anything in a client.

Public native and WebMCP tools share semantic inputs/results; transport wrappers differ. Native MCP returns text content (JSON text for structured public knowledge). WebMCP returns a JavaScript object, or `{template: "..."}` for the blank template. A client should handle the appropriate transport response rather than treating every result as identical wire JSON.

| Tool | Parameters | Content |
|---|---|---|
| `openclaim_guidance_index` | Empty object only | Situation categories, public incidents, routes, official sources, checked/review dates |
| `openclaim_response_plan` | Required closed `scenario`; optional closed `incident`, default `generic` | Editorial response choices, evidence checklist, requests, agency instructions, costs, limitations, sources |
| `openclaim_choices` | Empty object only | Public capability/template menu, modes and official navigation |
| `openclaim_template` | Required closed `kind` | Unfilled inquiry/compensation/mediation template |

Every tool rejects extra fields. No free-text case argument, private file read, completed-draft output, live victim lookup, sending or submission tool is present. `readOnlyHint` and `openWorldHint` describe behavior; annotations alone are not an authorization boundary.

## Example requests

These contain only public identifiers. Do not replace them with a user's notice or victim data.

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"openclaim_guidance_index","arguments":{}}}
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"openclaim_response_plan","arguments":{"scenario":"notice_only","incident":"skplanet_gifticon_2026_10"}}}
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"openclaim_template","arguments":{"kind":"compensation"}}}
```

A real MCP connection must complete its initialize/initialized handshake before these calls. The Skill can explain the returned guidance and official sources without collecting a name, contact, notice or account number. The user may instead choose any listed situation directly; one choice does not authorize subsequent procedures. Read source dates and limitations with the recommendation, not as a guarantee of current eligibility.

## Packages and static distribution

GitHub Releases contain native binaries for the supported operating systems, a browser/service distribution, a standalone Skill archive and `SHA256SUMS`. Native archives also include this documentation, a sample MCP configuration, the Skill and an exported `service.json`. The browser archive contains the service entry, public runtime, optional private workspace, WASM, Skill, configuration example, public source data and descriptor.

Actions compiles, validates, packages and publishes public software. GitHub Pages serves the distribution entry and static assets. Neither hosts a persistent MCP process nor executes a user's claim. Case data is never a workflow argument, artifact or repository contribution. A trusted local installation remains the option for users who do not want hosted browser execution.
