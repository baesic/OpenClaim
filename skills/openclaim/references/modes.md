# Modes and service page

OpenClaim is Apache-2.0 MCP/Skill software for a user's own privacy-breach response preparation. It distributes methods and tools; its operator does not handle cases. The service page is an installation/integration directory, not a claim intake website.

1. **Native MCP — primary:** install the Rust executable from a verified GitHub Release or build `cargo build --locked --release -p openclaim-mcp`. Configure a local client to execute it over stdio. Public guidance and blank templates only. Optional authenticated loopback HTTP supports local non-browser clients, never an internet endpoint.
2. **Browser WASM — primary:** `browser.html` executes the same public Rust functions. Optional WebMCP uses feature detection on `document.modelContext`; unsupported browsers retain manual public tools. A separate optional `workspace.html` provides local drafting, file downloads and Web Crypto backup and registers no WebMCP tools.
3. **Skill only — auxiliary, standalone:** install this complete directory in a host-supported skills path. Use the bundled response guide and blank templates without installing MCP or visiting the service page. Fill private values outside the AI host.

WebMCP is a browser API, not an HTTP MCP endpoint. A cloud client needing an internet URL cannot reach the user's stdio or loopback server. This project does not tunnel it to the internet. GitHub Actions builds and distributes software; it is not a runtime for the user's case.

See [integration.md](integration.md) for the tool contract and requests. No mode requires a fixed progression or the optional drafting interface. A Skill is guidance, not a sandbox. Local-only design cannot prevent extensions, independent DOM/screenshot tools, malware or user-enabled screen sharing from reading private data, and cannot retract data already entered into cloud AI.
