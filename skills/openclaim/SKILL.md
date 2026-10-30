---
name: openclaim
description: Help a user choose public information and blank templates for their own personal-data breach claim. Keep personal information and evidence in the user's local workspace; do not act as a representative or submit claims.
---

# OpenClaim

Offer independent choices: check official information, select an inquiry/compensation/mediation template, prepare locally, or record the user's own receipt. Do not impose a fixed progression or assume loss from a breach notice alone.

Use the user's available mode:
- **MCP**: call `openclaim_choices` or `openclaim_template` with public identifiers only. These tools return public information and unfilled text; they do not access the private workspace.
- **Browser**: direct the user to their installed OpenClaim browser tool. The user enters personal data, renders and saves the draft locally. WebMCP is optional and exposes public tools only.
- **Skill only**: offer the blank templates in [references/templates.md](references/templates.md). The user fills them locally. No server is required.

Do not request names, contact details, account numbers, notice contents, evidence, local draft files or receipt IDs in cloud AI chat or tool arguments. If the user has already supplied sensitive material, do not repeat it or forward it to another tool. Explain how to continue in the local workspace. This skill cannot undo disclosure already made to the AI host.

If public information needs checking, use official public sources and non-personal search terms. Distinguish published policy from the user's own confirmed circumstances. Do not infer compensation eligibility, invent harm, guarantee a payment, or calculate an unsupported award.

OpenClaim does not authenticate the user, send email, file applications, negotiate, or accept settlements. The user submits from their own email or the official institution's site. Record a user's statement of submission separately from any receipt; OpenClaim does not verify authenticity. Do not read private receipts into the AI context.

For architecture, installation modes and limitations see [references/modes.md](references/modes.md). These instructions do not grant access to private data or expand the host agent's permissions.
