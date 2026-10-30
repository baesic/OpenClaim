# ◈ OpenClaim

**개인정보 피해 대응안을 나의 Agent에 연결.** 개인정보 유출 대응안·공식 신청 방법·빈 양식을 AI Agent가 활용하도록 제공하는 Rust 기반 **MCP 서버·Skill 오픈소스 프로젝트**입니다. MCP와 브라우저 WASM이 주력 실행 방식이며, Skill만 받아 부분 응용할 수도 있습니다.

> **개발 미리보기 — 0.1.0-alpha.3.** 법적 결과·보상액을 보장하지 않습니다. 조회·본인인증·신청·제출·합의는 사용자가 직접 선택해 수행합니다. 운영자는 개인 사건에 관여하지 않습니다.

[서비스 페이지](https://baesic.github.io/OpenClaim/)는 설치 패키지·설정·도구 명세·Skill·실행 방식을 안내하는 배포 진입점입니다. 신청인을 받는 웹서비스나 원격 MCP 주소가 아닙니다.

## 제공 방식

| 방식 | 우선 역할 | 실행·운영 | 제공 내용 |
|---|---|---|---|
| 로컬 MCP 서버 | 주력 | 사용자 PC / MCP 지원 클라이언트 | 공개 대응안·기관별 신청 방법·증빙 체크리스트·빈 양식을 도구로 제공. 기본 stdio, 선택적 인증 loopback HTTP |
| 브라우저 WASM | 주력 | 사용자 브라우저 | 같은 Rust 핵심의 공개 도구 실행. WebMCP 지원 시 Agent 연결, 미지원 시 직접 선택 |
| Skill 단독 | 보조·독립 응용 | 사용자의 Agent 환경 | 서버 없이 대응 지침·공식 근거·빈 양식 활용. MCP나 서비스 페이지 방문 불필요 |

개인정보가 필요한 문서 작성은 **선택형 보조 도구**입니다. 공개 도구 실행 화면과 별도의 로컬 작성 공간에서 사용자가 직접 처리하며, 이 화면에는 WebMCP를 등록하지 않습니다. MCP/Skill의 사용을 위해 작성 화면을 거칠 필요가 없습니다.

## MCP 설치·연동

[개발 릴리스](https://github.com/baesic/OpenClaim/releases/tag/v0.1.0-alpha.3)의 운영체제별 실행 파일을 받고 같은 릴리스의 `SHA256SUMS`를 대조하세요. macOS Apple Silicon, Linux x86_64 GNU, Windows x86_64를 제공합니다. 다른 환경은 소스 빌드 후 직접 호환성을 확인하세요.

압축을 풀고 MCP 지원 **로컬 클라이언트**에 [설정 예시](examples/mcp-config.json)를 등록하세요. 자신의 실행 파일 절대 경로로 바꿔야 합니다. 클라이언트마다 설정 방식은 다릅니다.

```json
{
  "mcpServers": {
    "openclaim": {
      "command": "/absolute/path/to/openclaim-mcp",
      "args": []
    }
  }
}
```

Windows 실행 파일은 `openclaim-mcp.exe`입니다. stdio는 클라이언트가 프로세스를 시작하므로 API 키·호스팅·상시 서버 계정이 필요 없습니다. 소스 빌드는 Rust 1.95.0과 Git이 있는 환경에서:

```sh
git clone --branch dev/initial-build https://github.com/baesic/OpenClaim.git
cd OpenClaim
cargo build --locked --release -p openclaim-mcp
./target/release/openclaim-mcp --describe
```

인수 없이 실행하면 표준 입력에서 MCP 연결을 기다립니다. `--describe`는 실제 도구 스키마를 포함한 공개 배포 명세를 출력합니다. 선택형 로컬 HTTP는 [설치 안내](docs/INSTALL.md)를 참고하세요. 인터넷 접속용 MCP 서버는 운영하지 않습니다.

## Agent에 제공하는 도구

| 도구 | 허용 입력 | 응답 |
|---|---|---|
| `openclaim_guidance_index` | `{}` | 8개 상황·기관 역할·공개 공지·공식 출처·확인일 |
| `openclaim_response_plan` | 공개 `scenario`, 선택적 `incident` | 대응 선택지·증빙·요청 예시·기관별 신청 방법·비용·한계·근거 |
| `openclaim_choices` | `{}` | 기능·사용 방식·빈 양식 선택지·공식 경로 |
| `openclaim_template` | `kind`: `inquiry`, `compensation`, `mediation` | 사용자가 로컬에서 채울 빈 양식 |

예: `openclaim_response_plan({"scenario":"notice_only","incident":"skplanet_gifticon_2026_10"})`. 상황 식별자는 일반 대응안을 선택하는 값이며 개인 피해 기록이 아닙니다. 도구는 이름·연락처·사건 내용·증빙 등 추가 필드를 거절합니다. 개인 자격 판정·실시간 피해 조회·자동 제출은 수행하지 않습니다.

[도구 계약·연동 예시](docs/SERVICE.md) · [배포 명세 JSON](https://baesic.github.io/OpenClaim/service.json). `service.json`은 OpenClaim 자체 형식으로, 표준 MCP 자동 설치 파일이나 레지스트리 인증이 아닙니다.

## 브라우저 WASM 실행

[공개 도구 실행 화면](https://baesic.github.io/OpenClaim/browser.html)에서 대응안·양식을 직접 선택할 수 있습니다. WebMCP 지원 환경에서는 동일한 네 가지 공개 도구를 Agent에 제공합니다. WebMCP는 실험적인 브라우저 API이며 `document.modelContext.registerTool`을 감지합니다. 미지원 환경에서는 수동 도구 선택을 제공합니다. 원격 MCP URL·stdio 연결을 대신하지 않습니다. [Chrome 공식 문서](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools)

브라우저 패키지를 받아 **사용자의 PC에서** 실행하거나 소스로 빌드할 수 있습니다:

```sh
cargo install wasm-bindgen-cli --version 0.2.121 --locked
bash scripts/build-web.sh
python3 scripts/serve-web.py
```

`http://127.0.0.1:4173`의 구조:

- `/index.html`: 스크립트 없는 서비스 안내. MCP 설치·Skill 받기·도구 명세·실행 모드 안내.
- `/browser.html`: 공개 WASM 도구 + 선택적 WebMCP. 개인정보 입력 없음.
- `/workspace.html`: 선택형 개인 작성 보조 도구. WebMCP 미등록, 초안·해시·수동 접수 메모·암호화 파일을 로컬 처리.

`file://`에서도 서비스 안내의 텍스트와 설치 정보는 볼 수 있지만 WASM 실행은 HTTP/HTTPS가 필요합니다. 생성된 패키지 링크는 `dist/`나 릴리스에 포함됩니다. 소스의 `web/`만 직접 열면 생성 파일은 아직 없습니다. 실행 도구에는 JavaScript와 브라우저 WASM 로딩이 필요하며 오프라인 캐시는 제공하지 않습니다.

## Skill 단독 적용

[Skill 패키지](https://baesic.github.io/OpenClaim/openclaim-skill.tar.gz)를 풀거나 [skills/openclaim](skills/openclaim) 전체 디렉터리를 Agent가 지원하는 Skill 경로에 복사하세요. `SKILL.md`, `agents/`, `references/`를 함께 설치합니다. 특정 호스트의 설치 방식은 해당 호스트 안내를 따르세요.

요청 예시: “개인정보를 묻지 말고 유출 안내만 받은 경우의 대응 선택지와 공식 신청 방법을 알려줘.” Skill은 번들된 대응안과 출처를 직접 사용하며, MCP가 있으면 같은 공개 도구를 활용합니다. Skill은 AI 호스트의 개인정보 접근 권한을 강제로 통제하는 보안 장치가 아닙니다.

## 포함한 대응안과 공식 근거

유출 안내 수신(`notice_only`), 유출 확인(`confirmed_leak`), 쿠폰 무단 사용(`coupon_misuse`), 금융 사기(`financial_fraud`), 명의도용(`identity_misuse`), 계정 도용·스미싱(`account_takeover`), 사업자 미회신·거절(`business_no_response`), 분쟁조정 준비(`mediation_preparation`). 선택적 공개 공지: `generic`, `skplanet_gifticon_2026_10`.

사업자 문의·보상 검토, KISA 조사·시정, 개인정보 분쟁조정, 경찰·금융기관 긴급 대응, Msafer 예방, 소비자 거래 분쟁의 역할과 신청 방법을 구분합니다. 각 대응안에 증빙 목록, 요청 예시, 비용과 한계, 공식 출처를 제공합니다. **근거 확인 2026-10-30 / 재검토 예정 2026-11-30**의 정적 안내입니다. 최신 조건과 비용은 이용 시 공식 기관에서 다시 확인하세요.

공통 원본은 [공개 대응 데이터](data/kr-response-guide.json)입니다. Rust/MCP/WASM이 같은 자료를 사용하며 [Skill 독립 안내](skills/openclaim/references/response-guide.md)는 `python3 scripts/sync-guidance.py`로 생성합니다. CI가 동기화를 검증합니다.

## 개인정보와 운영 경계

- MCP/WebMCP는 공개 안내와 빈 양식만 제공합니다. 개인 문서·증빙·접수번호를 AI 도구에 전달하지 않습니다.
- 선택형 작성 도구는 메모리에서 처리하며 자동 저장·전송하지 않습니다. 선택 시 파일을 내 PC에 저장합니다. 암호화 보관은 AES-256-GCM / PBKDF2-SHA256 600,000회를 사용합니다.
- 증빙 원본을 업로드하지 않습니다. 로컬에서 파일명·크기·SHA-256만 기록하며, 해시가 진위·법적 증명력을 보장하지는 않습니다.
- 사건 저장소·사용자 계정·대리 신청·메일 발송·자동 접수·합의·유료 절차 실행·분석 추적·외부 폰트·클라우드 백업이 없습니다.
- GitHub Actions는 공개 소프트웨어를 빌드·시험·배포하며 사용자의 사건 자료를 처리하지 않습니다. 서비스 페이지는 정적 배포 안내입니다.
- 정적 호스트는 IP 등 접속 메타데이터를 볼 수 있습니다. AI 호스트·브라우저 확장·화면 읽기·기기 침해까지 차단할 수는 없습니다. 이미 AI에 제공한 개인정보를 회수하지 못합니다. [보안 경계](SECURITY.md)를 확인하세요.

## 개발·검증·정식 제공

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
cargo build --locked -p openclaim-mcp
python3 scripts/smoke-mcp.py
python3 scripts/smoke-http.py
npm test
python3 scripts/sync-guidance.py --check
bash scripts/build-web.sh
node --test tests/distribution.test.js
```

초기 개발과 개발 미리보기는 `dev/initial-build`에서 유지합니다. [릴리스 기준](docs/RELEASE.md)과 정식 제공 결정을 거쳐 `main`에 병합하고 기본 브랜치를 바꾼 뒤, 병합된 임시 브랜치를 삭제합니다. 태그·PR·변경 이력은 보존합니다. 개발 릴리스 발행만으로 `main` 전환이 이루어지지는 않습니다.

[설계](docs/ARCHITECTURE.md) · [설치](docs/INSTALL.md) · [서비스·도구 명세](docs/SERVICE.md) · [기여](CONTRIBUTING.md) · [Apache-2.0](LICENSE)
