# Development and release lifecycle

Current implementation: `dev/initial-build`, version `0.1.0-alpha.2`. `main` holds only the initial scope until the user decides the project is ready. Development preview publication and prereleases do not promote the code to stable.

## Before a stable release

- Rust fmt, Clippy, unit tests, real stdio handshake/tool tests, JS privacy tests and release WASM build pass.
- CI release builds succeed for Linux x86_64, macOS ARM64 and Windows x86_64. Add platform coverage before advertising other binaries.
- Browser manual fallback, supported WebMCP registration, draft validation, encrypted backup, file hashing, clear/reset and responsive layout are checked with synthetic data. Clearly report any environment where WebMCP registration could not be tested.
- No real personal data in current files, history, artifacts, logs or screenshots. No private fields/results in MCP tools. No outgoing case-data requests.
- Review dependencies, distribution integrity, browser host isolation, accessibility and limits; address material findings. Passing tests is not a legal/security certification.
- Official information links work; the project does not present unverified case-specific conditions, awards or fees as facts. Obtain appropriate legal review before expanding into representation or monetized case handling.
- Record outstanding limits in release notes and obtain the user's stable-release decision.

## Promote

1. Complete review via a PR from the development branch into `main`.
2. Merge tested changes, update the version and tag from the reviewed main commit.
3. Change GitHub's default branch to `main`; update clone/install docs to use `main` or a pinned tag.
4. Publish release assets and static browser site; verify download checksums and installed operation.
5. After checking the merge and default-branch switch, delete `dev/initial-build` locally and remotely. Keep tags, PR and commit history. Never force-delete unmerged work.

The release workflow accepts prerelease tags from development. Stable tags are rejected unless their commit is reachable from `main`; tag version must equal the workspace version. This gate does not replace branch protection or human review. Pages deployment is manual during development and automatic for relevant changes on `main`.
