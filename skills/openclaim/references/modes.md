# Modes

OpenClaim is Apache-2.0 software. It offers tools for a user's own preparation, with no project-operated case service.

1. Browser: Rust compiled to WASM handles drafts. Standard JavaScript supplies the interface, local file downloads and Web Crypto encrypted backup. No cloud model is required. WebMCP uses feature detection on `document.modelContext`; unsupported browsers retain manual operation.
2. Local MCP: install the Rust executable from a verified GitHub Release, or build `cargo build --locked --release -p openclaim-mcp`. Configure a client to execute `openclaim-mcp` over stdio. Only public guidance and blank templates are exposed. Optional authenticated loopback HTTP is for local non-browser clients, never a public endpoint.
3. Skill only: install this directory in a host-supported skills directory. Read the blank templates without requiring the OpenClaim executable. Fill private values outside the AI host.

WebMCP is a browser API, not a network MCP endpoint. A cloud client needing an internet URL cannot reach a user's stdio or loopback server. This project does not tunnel the local service to the internet.

Local-only processing does not prevent a browser extension, screen reader agent, malicious host, malware, or a user-enabled screen-sharing feature from reading private data. Check those permissions before entering information. The software cannot retract data already entered into a cloud AI conversation.
