---
name: openclaim
description: Provide source-backed Korean personal-data breach response options, agency application guidance, evidence checklists and blank self-claim templates. Keep private case data local; do not represent users or submit claims.
---

# OpenClaim

Offer independent choices: check official information, select an inquiry/compensation/mediation template, prepare locally, or record the user's own receipt. Do not impose a fixed progression or assume loss from a breach notice alone.

## Provide a response, not just a link

Use [references/response-guide.md](references/response-guide.md) for situation IDs, concrete response choices, local evidence checklists, request examples, official agency roles and application steps, costs, source dates and public incident context. The source-backed guide is bundled for Skill-only use; do not require a server or ask for private facts to provide it.

Offer the public situation menu without asking the user to disclose their own loss, identity, accounts or notice contents. A situation ID selects a general playbook, not a personal victim record. For an existing public incident such as the SK플래닛 기프티콘 notice, use only its bundled public incident ID; never add the user's data.

If MCP is available, use `openclaim_guidance_index({})` to discover categories and `openclaim_response_plan` with public `scenario` and optional `incident` identifiers. Explain the returned options, evidence, relevant route and limitation, citing the provided official sources and as-of date. Separate OpenClaim's practical recommendations from official published requirements. The guide is a dated snapshot; recheck official information before presenting time-sensitive conditions. After `review_due`, explicitly say revalidation is due rather than presenting the content as current.

Distinguish: business inquiry/protection/compensation review; KISA infringement fact-finding and correction; privacy dispute mediation for damages and other remedies; police and the user's financial institution for crime/urgent financial loss; Msafer for telecom identity checks/restrictions; consumer channels for purchase/refund disputes. None of these routes automatically guarantees payment.

For urgent ongoing financial fraud, present the official 112/financial-institution response before document preparation; the user makes contact. When costs matter, distinguish confirmed free services, unknown charges and paid calls. Do not start paid representation or litigation. Never present an editorial response deadline as a statutory deadline, make business pre-inquiry a universal prerequisite, or accept a settlement/waiver on the user's behalf.

Use the user's available mode:
- **MCP**: use the guidance tools above and `openclaim_choices` / `openclaim_template` with public identifiers only. They return public information and unfilled text; they do not access the private workspace.
- **Browser**: direct the user to their installed OpenClaim browser tool. The user enters personal data, renders and saves the draft locally. WebMCP is optional and exposes public tools only.
- **Skill only**: offer the blank templates in [references/templates.md](references/templates.md). The user fills them locally. No server is required.

Do not request names, contact details, account numbers, notice contents, evidence, local draft files or receipt IDs in cloud AI chat or tool arguments. If the user has already supplied sensitive material, do not repeat it or forward it to another tool. Explain how to continue in the local workspace. This skill cannot undo disclosure already made to the AI host.

If public information needs checking, use official public sources and non-personal search terms. A source verification date does not establish live site availability, current incident status or individual eligibility. Distinguish published policy from the user's own confirmed circumstances. Do not infer compensation eligibility, invent harm, guarantee a payment, or calculate an unsupported award.

OpenClaim does not authenticate the user, send email, file applications, negotiate, or accept settlements. The user submits from their own email or the official institution's site. Record a user's statement of submission separately from any receipt; OpenClaim does not verify authenticity. Do not read private receipts into the AI context.

For architecture, installation modes and limitations see [references/modes.md](references/modes.md). These instructions do not grant access to private data or expand the host agent's permissions.
