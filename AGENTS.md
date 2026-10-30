# OpenClaim development

- Work on development/feature branches. Do not promote to `main` or delete a branch until the release criteria and the user's release decision are satisfied.
- Never copy users' real notices, identity/contact/account details, evidence or private cases into this repository, tests, screenshots, CI, issues or artifacts. Use visibly synthetic fixtures. Reviewed public agency/business contacts and paraphrased official incident guidance may be stored in the public source-backed guide; this never authorizes publishing victim information.
- MCP and WebMCP expose public choices and blank templates only. No private form reads, local draft resources, arbitrary file access, case status, free-text case arguments, network submission, email or settlement tools.
- Keep private computation in `crates/core` and the local browser workspace. Public tool functions must not capture DOM/form state. Do not add telemetry or external dependencies loaded at runtime.
- User choice drives features. Do not infer an actual loss from a notice or mark an unverified receipt as authenticated.
- Maintain public response content in `data/kr-response-guide.json`; regenerate the standalone Skill reference with `scripts/sync-guidance.py`. Keep source IDs, checked dates, editorial recommendations, cost uncertainty and official application requirements explicit. No fabricated eligibility, compensation amount or mandatory prerequisite.
- Preserve the three installation modes and manual browser fallback. Do not present WebMCP as a hosted network MCP endpoint.
- Run Rust formatting, Clippy, workspace tests, stdio smoke test, JavaScript tests and WASM build for relevant changes. Visually inspect browser changes. No real case submission during testing.
