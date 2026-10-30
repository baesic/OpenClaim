# Agent integration contract

OpenClaim provides MCP tools and a reusable Skill for an individual's own privacy-breach response. Its service page distributes packages, configuration and documentation; it is not a case intake site or a remote MCP endpoint. Do not require the user to visit the page or open the optional drafting interface to receive a response plan.

Native MCP and browser WASM are the two primary execution modes. Skill-only use is an independent auxiliary mode: read the bundled response guide and templates directly when no tool server is installed. The same public knowledge is available without collecting private case facts.

## Tool requests

Discover actual capabilities with the host's MCP tool listing. Public examples:

- `openclaim_guidance_index({})`
- `openclaim_response_plan({"scenario":"notice_only","incident":"generic"})`
- `openclaim_choices({})`
- `openclaim_template({"kind":"compensation"})`

Situation/incident/template identifiers are closed public categories. Never add a name, contact, notice, account number, evidence, local path or receipt ID. Native results wrap public JSON or blank text in MCP content; WebMCP returns an object. Neither channel retrieves a private draft. Source dates and stated costs/limits must accompany substantive guidance.

Examples of suitable user requests: “유출 안내만 받은 상황의 대응 선택지와 공식 신청 방법을 알려줘”; “분쟁조정 준비에 필요한 증빙과 비용 주의를 설명해줘”; “개인정보 없이 보상 검토 요청 빈 양식을 보여줘”. Explain options directly rather than asking for personal details or imposing a fixed workflow.

## Installation and optional interfaces

The user installs the native executable locally and configures its absolute path in an MCP-capable client. Default transport is stdio; optional authenticated HTTP binds only to loopback for local non-browser clients. There is no remote MCP URL or hosted case service. A cloud client requiring a public URL is outside this installation model.

The browser distribution has three independent surfaces: `index.html` for installation/integration, `browser.html` for public WASM/WebMCP tools, and `workspace.html` for optional local drafting with **no WebMCP registration**. WebMCP support is experimental; manual public tool selection remains available. The private workspace is optional; the user alone fills values, saves and submits. Never read its DOM, screenshots, files or exported drafts into AI context.

The published `service.json` / native `--describe` output is an OpenClaim-specific description with the actual MCP schemas. It is not a standard registry manifest or automatic installation grant. Installing this Skill does not install or launch an MCP server.
