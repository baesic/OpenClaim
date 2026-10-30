# Architecture and accepted product scope

OpenClaim provides methods and user-operated tools for an individual's own claim. The project operator has no case database, user accounts, claim inbox, intermediary role or authority to submit or settle.

```text
GitHub source / Releases / Skill / static browser assets
             | software distribution only
             v
 User's browser                         User's PC
 ├─ Rust WASM core                      └─ Rust MCP server
 ├─ private draft memory                    └─ public choices / blank templates
 ├─ evidence hash (local file read)                   |
 ├─ encrypted local backup                           v
 └─ public WebMCP tools ──────────────────── User-selected AI host
      no private draft reads

 The user separately submits from their own email / official portal.
```

`openclaim-core` has no network or filesystem dependencies. It supplies a public catalog, public templates and a local-only draft renderer. `openclaim-wasm` binds this core for browser use. `openclaim-mcp` only calls the public functions; it has no renderer tool. `web/public-tools.js` deliberately has no DOM access and only captures the public functions.

The browser supports free selection of inquiry, compensation review and mediation preparation. It never automatically advances the case. A user's receipt record is labeled unverified. No integration with a specific incident or named applicant is bundled.

## Environment adaptation

The browser uses experimental `document.modelContext.registerTool` when present. A missing API or failed registration leaves manual operation available. This is WebMCP, not HTTP/stdio MCP. Local MCP supports stdio by default and authenticated loopback-only Streamable HTTP for non-browser local clients. Cloud clients requiring an internet endpoint are outside the current deployment model. No public tunnels or Actions-hosted runtime are provided.

## GitHub responsibilities

Actions builds and tests public software, packages native binaries/browser/skill, and deploys static assets. It never accepts user case data as workflow input, cache, artifact or log. Runtime behavior is local. Main promotion is a separate release decision, not an automatic consequence of successful CI.

## Explicitly deferred

- Automatic business/agency submission, email connectors, account authentication or representation
- Central case hosting, public MCP runtime, LLM API integrations and paid services
- Parsing real notices in cloud AI, automated legal eligibility/award decisions
- Third-party receipt authentication, legal review certification and mobile native packaging

These are scope boundaries, not implied future commitments.
