// Public runtime only. The private workspace is a separate page/module.
import {publicTools, registerPublicTools} from './public-tools.js';
import {renderGuidance} from './guidance-view.js';
const $ = id => document.getElementById(id);
try {
  // Dynamic import keeps a useful failure status when the generated WASM files are absent.
  const wasm = await import('./pkg/openclaim_wasm.js');
  await wasm.default();
  const catalog = JSON.parse(wasm.public_catalog());
  const guide = JSON.parse(wasm.public_guidance_index());
  for (const scenario of guide.scenarios) {
    const option = document.createElement('option'); option.value = scenario.id; option.textContent = scenario.title;
    $('guide-scenario').append(option);
  }
  for (const incident of guide.incidents) {
    const option = document.createElement('option'); option.value = incident.id; option.textContent = incident.title;
    $('guide-incident').append(option);
  }
  $('guide-date').textContent = guide.as_of + ' 확인';
  const showGuidance = () => renderGuidance($('guide-output'), JSON.parse(wasm.public_response_plan($('guide-scenario').value, $('guide-incident').value)));
  $('guide-scenario').addEventListener('change', showGuidance); $('guide-incident').addEventListener('change', showGuidance); showGuidance();
  const showTemplate = () => { $('blank').textContent = wasm.public_template($('template-kind').value); };
  $('template-kind').addEventListener('change', showTemplate); showTemplate();
  for (const source of catalog.sources) {
    const a = document.createElement('a'); a.href = source.url; a.textContent = source.label + ' ↗';
    a.target = '_blank'; a.rel = 'noopener noreferrer'; $('sources').append(a);
  }
  for (const id of ['guide-scenario', 'guide-incident', 'template-kind']) $(id).disabled = false;
  $('runtime').textContent = 'Rust · WebAssembly 실행 준비 완료 · 공개 안내를 기기에서 생성합니다.';
  let registered = false;
  try {
    registered = registerPublicTools(document.modelContext, publicTools(wasm.public_catalog, wasm.public_template, {index:wasm.public_guidance_index, plan:wasm.public_response_plan}));
  } catch { /* Manual public tools remain available. */ }
  $('webmcp-status').textContent = registered ? 'WebMCP 공개 도구 4개 연결됨' : '직접 선택 가능 · WebMCP 미연결';
} catch {
  $('runtime').textContent = 'WASM을 불러오지 못했습니다. 배포 패키지를 로컬 웹 서버 또는 HTTPS에서 열어주세요. 서비스 안내에서 MCP·Skill 방식을 선택할 수도 있습니다.';
  $('webmcp-status').textContent = 'WebMCP 미등록 · WASM 로드 실패';
}
