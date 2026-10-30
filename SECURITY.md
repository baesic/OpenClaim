# Security and privacy boundaries

OpenClaim is a development preview, not a guarantee of zero data leakage or a completed security audit.

## Designed boundaries

- Private draft rendering runs in local Rust/WASM. No request is made to a cloud model or project-operated backend.
- The service entry (`index.html`) is a script-free installation/distribution page with no case fields. Public WebMCP tools run on `browser.html`. The optional private `workspace.html` uses a separate module and does not register WebMCP; this separation does not block an AI host's independent DOM/screen-reading permission.
- Browser assets are self-hosted; CSP disallows form submission, external scripts/fonts/frames and external fetch origins. `connect-src 'self'` permits WASM loading, not a claim-upload feature. CSP is defense in depth, not proof against a malicious replacement build.
- No telemetry, persistent browser storage, background sync or automatic update service is included. Browser memory holds input until it is cleared or the tab closes.
- Public MCP/WebMCP tools accept only closed template, general playbook and reviewed public incident identifiers or an empty object. They do not access the private form or return private documents. They do not read arbitrary local files or execute shell commands. Categories chosen by a cloud AI client are already visible to that AI host; do not treat a category as a private victim report.
- HTTP binds to IPv4 loopback only, requires a bearer token and exact Host, rejects all Origin headers, and has no CORS allowance. Prefer stdio. Tokens are local credentials, not cloud identity.
- Optional backup encrypts data with AES-GCM and per-file random salt/IV. Key derivation uses PBKDF2-SHA256 600,000 iterations. No password recovery is provided. A weak password remains weak despite encryption.
- Evidence selection reads local bytes to hash them, then retains filename/size/hash only. File content is not stored in a backup. The user must retain originals separately.

## Outside this boundary

The AI host sees anything the user gives it. Browser agents/extensions with DOM/screenshot access may read the private workspace regardless of the narrow WebMCP API. A local MCP process cannot retract private arguments already sent by a cloud client. Users needing strict isolation should use a trusted local installation, disable unwanted extensions/screen sharing, and avoid cloud AI while handling private data.

The static host sees ordinary connection metadata such as IP addresses. A compromised host/release/dependency/OS/browser can compromise the application. Public hosting under a shared origin can also be affected by same-origin scripts or service workers from other projects; local serving is preferable for stronger separation. Sensitive values are not placed in URL parameters by OpenClaim. Official links are opened with no-referrer and noopener, without draft data.

Clearing inputs does not guarantee secure erasure from device memory, OS swap, accessibility buffers, browser recovery or already downloaded files. Plaintext exports are intentionally user-readable and need the user's own storage protection. Receipt notes are user-entered and not independently verified. This software does not determine legal eligibility or validate compensation amounts.

## Reporting

Do not include real case details, identity information, credentials or evidence in public issues. For a vulnerability, use the repository's private vulnerability reporting feature when available, with a synthetic reproduction. If it is unavailable, open an issue requesting a private contact without vulnerability details or sensitive data. Do not upload actual user data to demonstrate a problem.
