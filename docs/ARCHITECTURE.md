# Architecture and accepted product scope

OpenClaim is an Agent toolkit distributed as a Rust MCP server, browser WASM runtime and standalone Skill. A service page is included for discovering, installing and integrating those deliverables. It is not the primary claim-form product, a case intake website or a project-operated MCP endpoint. The operator has no user accounts, case database, claim inbox, intermediary role or authority to submit or settle.

## Distribution versus runtime

```text
GitHub source / Actions / Releases / Pages
 ├─ native MCP package + configuration + actual tool descriptor
 ├─ browser WASM package
 ├─ standalone Skill + response knowledge + blank templates
 └─ service entry: installation / integration / tool directory (no JS or case form)
                    | public software distribution only
                    v
 User PC                              User browser
 └─ Rust MCP server                   ├─ browser.html: public WASM tools
    └─ public tool contract ──┐       │  └─ optional public WebMCP ──┐
                              v       │                            v
                       User-selected Agent                  User-selected Agent
                                      │
                                      └─ workspace.html: optional local draft
                                         ├─ no WebMCP registration
                                         ├─ private draft memory / evidence hash
                                         └─ manual file export / encrypted backup

 Skill-only: Agent reads bundled public knowledge; no server/page required.
 User separately queries, authenticates, submits and settles via official channels.
```

Native MCP and browser WASM are primary modes. Standalone Skill is an independent auxiliary mode for reuse without a server. Any mode provides useful response options directly; no case progression, private form completion or visit to the service page is required.

## Components

`openclaim-core` has no network or filesystem dependencies. It supplies a public catalog, source-backed response guidance, blank templates and an optional local-only draft renderer. `openclaim-wasm` binds this core for browser use. `openclaim-mcp` calls only the public functions, not the private renderer. Its `--describe` command exports the actual router schemas and public distribution metadata, included as `service.json`. This is an OpenClaim-specific descriptor, not an MCP standard registry file.

`web/index.html` is a script-free service directory. `web/browser.js` runs public functions and registers WebMCP if supported. `web/public-tools.js` has no DOM/form access and captures only public callbacks. The separate private `web/workspace.html` / `web/app.js` does not import or register WebMCP tools. It keeps private values in memory and offers only explicit local exports. This separation reduces accidental coupling; it is not a sandbox against an AI host with separate DOM/screenshot permissions.

`data/kr-response-guide.json` is the public knowledge source embedded in Rust. `scripts/sync-guidance.py` generates the standalone Skill reference and CI checks drift. Eight closed public situation categories and optional reviewed public incident IDs select general playbooks, not victim reports. Results include recommended options, evidence checklists, request examples, agency procedures, cost uncertainty, source IDs, checked dates and a review-due date. Runtime performs no live lookup or individual eligibility decision. An AI host already sees any category it sends, so the Skill offers a public menu rather than soliciting personal facts.

## Environment adaptation

The public browser runtime uses experimental `document.modelContext.registerTool` when present. Missing support or failed registration leaves manual public tool operation available. The service page remains useful without JavaScript or built WASM. Running WASM itself requires served HTTP/HTTPS assets; opening the source `web/` directly cannot provide the generated packages.

WebMCP is not HTTP/stdio MCP. Native MCP defaults to stdio, with optional authenticated loopback-only Streamable HTTP for non-browser local clients. Cloud clients requiring an internet endpoint are outside the deployment model. No public tunnels or Actions-hosted runtime are provided. The browser mode does not connect to the local HTTP server; it executes WASM itself.

## GitHub and release responsibilities

Actions builds, tests and packages public native binaries/browser/Skill, then deploys the static service distribution. It never accepts case data as workflow input, cache, artifact or log. Runtime is local and user operated. Development publication is distinct from stable release approval. After the user's stable-release decision, merge into `main`, change the default branch, publish the reviewed release, then delete merged temporary branches while preserving tags/history.

## Explicitly deferred

- Automatic submission, email connectors, account authentication, representation or settlement
- Central case hosting, public MCP runtime, LLM API integrations or paid services
- Parsing real notices in cloud AI, legal eligibility/award decisions
- Receipt authentication, legal review certification and mobile native packaging

These are scope boundaries, not implied future commitments. [SERVICE.md](SERVICE.md) defines the tool/distribution contract; [SECURITY.md](../SECURITY.md) explains its limits.
