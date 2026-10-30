# ◈ OpenClaim

**나의 정보, 나의 선택.** 개인정보 유출에 대한 본인의 보상 신청을 준비하는 Rust 기반 오픈소스 도구입니다.

> **개발 미리보기 — 0.1.0-alpha.1.** 법적 결과나 보상액을 보장하지 않으며, 정식 서비스 적합성 검토가 끝난 버전이 아닙니다. 실제 제출·본인인증·합의는 사용자가 직접 수행합니다.

## 세 가지 사용 방식

| 방식 | 실행 장소 | 기능 |
|---|---|---|
| 브라우저 / WASM | 사용자 브라우저 | 로컬 초안, 증빙 해시, 수동 접수 기록, 암호화 파일 보관. WebMCP 지원 시 공개 도구 연결 |
| 로컬 MCP 서버 | 사용자 PC | 공개 안내·선택지·빈 양식을 AI에 제공. 기본 stdio, 선택적 인증 loopback HTTP |
| Skill 단독 | 사용자의 Agent 환경 | 서버 없이 공개 안내와 빈 양식 활용. 개인정보는 AI 대화 밖에서 직접 입력 |

공통 Rust 핵심을 브라우저 WASM과 MCP에서 재사용합니다. 브라우저의 UI·파일 저장·Web Crypto에는 JavaScript를 사용합니다. MCP와 WebMCP는 작성된 개인정보 문서를 읽거나 반환하는 기능을 제공하지 않습니다.

## 빠른 시작

### 로컬 MCP

Rust 1.95.0과 Git을 설치한 환경에서:

```sh
git clone --branch dev/initial-build https://github.com/baesic/OpenClaim.git
cd OpenClaim
cargo build --locked --release -p openclaim-mcp
./target/release/openclaim-mcp
```

프로세스가 표준 입력에서 MCP 연결을 기다리는 것이 정상입니다. AI 클라이언트에서 [examples/mcp-config.json](examples/mcp-config.json)의 실행 파일 경로를 자신의 절대 경로로 바꾸어 등록하세요. Windows 실행 파일은 `openclaim-mcp.exe`입니다. 지원하는 설정 형식은 클라이언트마다 다릅니다.

릴리스가 제공되는 경우 [Releases](https://github.com/baesic/OpenClaim/releases)에서 운영체제에 맞는 실행 파일과 `SHA256SUMS`를 내려받아 해시를 대조한 뒤 실행할 수 있습니다. 첫 릴리스 이전에는 소스 빌드를 사용하세요.

노출 도구:
- `openclaim_choices({})`: 공개 선택지와 공식 안내 링크
- `openclaim_template({"kind":"inquiry|compensation|mediation"})`: 빈 양식

이 도구에 이름·연락처·사건 내용·증빙을 입력하지 마세요. 알 수 없는 필드는 거절합니다. 이미 클라우드 AI에 제공한 입력은 OpenClaim이 회수하거나 통제할 수 없습니다.

선택적 로컬 HTTP 실행은 [설치 안내](docs/INSTALL.md)를 참고하세요. 인터넷에서 연결하는 원격 서비스는 제공하지 않습니다.

### 브라우저

```sh
cargo install wasm-bindgen-cli --version 0.2.121 --locked
bash scripts/build-web.sh
python3 scripts/serve-web.py
```

`http://127.0.0.1:4173`에서 사용합니다. Rust toolchain 설정이 WASM target을 설치합니다. 배포는 `dist/`의 정적 파일만 필요합니다. GitHub Actions가 동일한 파일을 빌드하며 Pages 또는 릴리스로 배포할 수 있습니다. `file://`로 직접 열면 WASM 로드가 실패할 수 있습니다.

WebMCP는 실험적인 브라우저 API입니다. `document.modelContext.registerTool`이 있으면 공개 도구만 등록하며, 없으면 일반 수동 화면으로 작동합니다. WebMCP는 인터넷 MCP URL이 아니며 클라우드 AI의 URL 연결을 대신하지 않습니다. [Chrome 공식 문서](https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools)

### Skill 단독

[skills/openclaim](skills/openclaim) 디렉터리를 사용하는 Agent의 skills 디렉터리로 복사합니다. 예를 들어 Codex에서는 `~/.codex/skills/openclaim/`에 두고 `$openclaim`으로 호출합니다. [SKILL.md](skills/openclaim/SKILL.md)와 참조 양식을 함께 설치해야 합니다. Skill은 로컬 전용 처리 원칙을 안내하지만 AI 호스트의 권한을 강제 통제하지는 않습니다.

## 개인정보 경계

- 브라우저 초안은 메모리에서 처리하며 자동 저장하지 않습니다. 선택 시 암호화 보관 파일을 사용자 PC에 저장합니다.
- 암호화: Web Crypto AES-256-GCM, 파일마다 새 salt·IV, PBKDF2-SHA256 600,000회. 비밀번호를 저장하지 않습니다.
- 증빙 원본을 업로드하지 않습니다. 사용자가 선택한 파일의 이름·크기·SHA-256을 로컬에서 기록합니다. 해시는 진위나 법적 증명력을 보장하지 않습니다.
- 공개 MCP 서버에는 사건 저장소, 개인정보 입력 양식, 발송·제출 기능이 없습니다.
- 광고·분석 추적·오류 원격 전송·외부 폰트·클라우드 백업이 없습니다. 소스와 양식을 받는 정적 호스트는 IP 등 접속 메타데이터를 볼 수 있습니다.
- 외부 브라우저 확장, AI의 화면/DOM 읽기, 악성 호스트, 기기 침해까지 막는 보장은 아닙니다. [보안 경계와 제한](SECURITY.md)을 읽어주세요.

## 개발 및 검증

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
cargo build --locked -p openclaim-mcp
python3 scripts/smoke-mcp.py
python3 scripts/smoke-http.py
npm test
bash scripts/build-web.sh
```

실제 사건 자료 대신 가상 데이터만 테스트에 사용하세요. `.gitignore`만으로 개인정보 유출이 방지되지는 않습니다.

## 브랜치와 공개

초기 구현은 `dev/initial-build`, 안정 버전은 `main`에서 관리합니다. 개발 중에는 개발 브랜치를 GitHub 기본 브랜치로 사용합니다. 정식 공개 전 [릴리스 기준](docs/RELEASE.md)을 통과하고 `main`에 병합한 뒤 기본 브랜치를 `main`으로 바꿉니다. 병합된 임시 브랜치는 삭제하고 버전 태그·변경 이력은 보존합니다. 이후 기능 개발은 짧은 기능 브랜치와 PR을 사용합니다.

GitHub Actions는 빌드·시험·릴리스·정적 사이트 배포만 수행하며, 사용자의 실제 사건을 실행하거나 처리하지 않습니다.

## 기여

[CONTRIBUTING.md](CONTRIBUTING.md) · [설계](docs/ARCHITECTURE.md) · [보안](SECURITY.md) · [Apache-2.0](LICENSE)
