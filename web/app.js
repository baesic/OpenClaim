import init, {public_catalog, public_template, public_guidance_index, public_response_plan, local_draft} from './pkg/openclaim_wasm.js';
import {publicTools, registerPublicTools} from './public-tools.js';
import {encryptVault, decryptVault} from './vault.js';
import {renderGuidance} from './guidance-view.js';

const $ = id => document.getElementById(id);
let ready = false, evidenceFiles = [], currentDraft = '', resetGeneration = 0, revision = 0;
const fields = ['kind','company','name','contact','loss-status','amount','facts','remedy','evidence','receipt-status','receipt-note'];
const say = text => { $('message').textContent = text; };
function invalidate() { revision++; currentDraft = ''; $('preview').textContent = '작성 내용이 변경되었습니다. 초안 미리보기를 눌러 다시 확인하세요.'; $('download').disabled = true; }
function lossChanged() { const enabled = $('loss-status').value === 'confirmed'; $('amount').disabled = !enabled; if (!enabled) $('amount').value = ''; }
function snapshot() { return {version:1,fields:Object.fromEntries(fields.map(id=>[id,$(id).value])),evidenceFiles}; }
function validateSnapshot(value) {
  if (!value || value.version !== 1 || !value.fields || !Array.isArray(value.evidenceFiles) || value.evidenceFiles.length > 100) throw new Error('지원하지 않는 작성 데이터입니다.');
  if (Object.keys(value.fields).length !== fields.length || !fields.every(id=>typeof value.fields[id] === 'string' && value.fields[id].length <= 20_000)) throw new Error('작성 항목을 확인하세요.');
  for (const [id, choices] of Object.entries({'kind':['inquiry','compensation','mediation'],'loss-status':['unknown','no_confirmed_loss','confirmed'],'receipt-status':['not_submitted','user_reported','receipt_recorded']})) if (!choices.includes(value.fields[id])) throw new Error('지원하지 않는 선택 값입니다.');
  for (const file of value.evidenceFiles) if (!file || typeof file.name !== 'string' || file.name.length > 1000 || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > 10 * 1024 * 1024 || !/^[0-9a-f]{64}$/.test(file.sha256)) throw new Error('증빙 기록 형식이 올바르지 않습니다.');
  return value;
}
function renderEvidence() {
  $('evidence-list').replaceChildren();
  for (const file of evidenceFiles) { const li = document.createElement('li'); li.textContent = `${file.name} · ${file.size} bytes · SHA-256 ${file.sha256}`; $('evidence-list').append(li); }
}
function download(text, filename, type='text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text],{type}));
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function showBlank() { if (ready) $('blank').textContent=public_template($('kind').value); }

$('draft-form').addEventListener('input',()=>{ invalidate(); lossChanged(); });
$('kind').addEventListener('change',()=>{ showBlank(); document.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.choice === $('kind').value))); });
$('draft-form').addEventListener('submit',event=>{
  event.preventDefault(); if (!ready) return;
  try {
    const raw=$('amount').value.trim();
    if (raw && (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))) throw new Error('손해 금액은 안전하게 표현 가능한 0 이상의 정수로 입력하세요.');
    const evidence = [$('evidence').value,...evidenceFiles.map(f=>`${f.name} (${f.size} bytes), SHA-256: ${f.sha256}`)].join('\n');
    currentDraft = local_draft(JSON.stringify({kind:$('kind').value,name:$('name').value,contact:$('contact').value,company:$('company').value,facts:$('facts').value,loss_status:$('loss-status').value,amount_krw:raw?Number(raw):null,requested_remedy:$('remedy').value,evidence}));
    $('preview').textContent=currentDraft; $('download').disabled=false; say('내 기기에서 초안을 만들었습니다. 외부로 전송되지 않았습니다.');
  } catch(error) { invalidate(); say(String(error.message || error)); }
});
$('download').addEventListener('click',()=>{ if(currentDraft) download(currentDraft,'openclaim-draft.txt'); });
$('clear').addEventListener('click',()=>{
  resetGeneration++;
  $('draft-form').reset(); evidenceFiles=[]; renderEvidence(); $('vault-password').value=''; $('load-vault').value=''; lossChanged(); invalidate(); $('preview').textContent='작성한 초안이 여기에 표시됩니다.'; showBlank(); $('kind').dispatchEvent(new Event('change')); say('이 화면의 입력과 기록을 지웠습니다. 이미 저장한 파일은 사용자가 직접 삭제하세요.');
});
$('evidence-files').addEventListener('change',async event=>{
  const generation = resetGeneration;
  event.target.disabled = true;
  try {
    const selected=[...event.target.files];
    if (evidenceFiles.length+selected.length>100 || selected.some(f=>f.size>10*1024*1024)) throw new Error('파일은 총 100개 이하, 각각 10 MiB 이하만 처리합니다.');
    const records=[];
    for (const file of selected) { const bytes=await crypto.subtle.digest('SHA-256',await file.arrayBuffer()); records.push({name:file.name,size:file.size,sha256:[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}); }
    if (generation !== resetGeneration) return;
    evidenceFiles.push(...records);
    renderEvidence(); invalidate(); say('내 기기에서 해시를 계산했습니다. 원본 파일은 업로드되지 않았습니다.');
  } catch(error) { if (generation === resetGeneration) say(error.message); } finally { event.target.value=''; event.target.disabled=false; }
});
$('save-vault').addEventListener('click',async()=>{
  const generation = resetGeneration;
  $('save-vault').disabled=true;
  try { const file=await encryptVault(snapshot(),$('vault-password').value); if (generation !== resetGeneration) return; download(file,'openclaim-backup.openclaim-vault','application/json'); $('vault-password').value=''; say('암호화한 보관 파일을 저장했습니다.'); } catch(error) { if (generation === resetGeneration) say(error.message); } finally { $('save-vault').disabled=!ready; }
});
$('load-vault').addEventListener('change',async event=>{
  const initialRevision = revision;
  try {
    const file=event.target.files[0]; if(!file) return;
    if(file.size>2_000_000) throw new Error('보관 파일이 너무 큽니다.');
    const value=validateSnapshot(await decryptVault(await file.text(),$('vault-password').value));
    if (revision !== initialRevision) throw new Error('복원 중 작성 내용이 변경되어 복원을 취소했습니다. 필요하면 다시 여세요.');
    fields.forEach(id=>{$(id).value=value.fields[id];}); evidenceFiles=value.evidenceFiles; renderEvidence(); lossChanged(); invalidate(); showBlank(); $('kind').dispatchEvent(new Event('change')); $('vault-password').value=''; say('내 기기에서 복호화했습니다. 초안을 다시 확인하세요.');
  } catch(error) { say(error.message); } finally { event.target.value=''; }
});

try {
  await init(); ready=true;
  const catalog=JSON.parse(public_catalog());
  const guide=JSON.parse(public_guidance_index());
  for(const scenario of guide.scenarios){const option=document.createElement('option');option.value=scenario.id;option.textContent=scenario.title;$('guide-scenario').append(option);}
  for(const incident of guide.incidents){const option=document.createElement('option');option.value=incident.id;option.textContent=incident.title;$('guide-incident').append(option);}
  $('guide-date').textContent=guide.as_of+' 확인';
  const showGuidance=()=>renderGuidance($('guide-output'),JSON.parse(public_response_plan($('guide-scenario').value,$('guide-incident').value)));
  $('guide-scenario').addEventListener('change',showGuidance);$('guide-incident').addEventListener('change',showGuidance);showGuidance();
  for(const choice of catalog.choices){ const button=document.createElement('button'); button.type='button'; button.dataset.choice=choice.id; button.textContent=choice.label; button.setAttribute('aria-pressed',String(choice.id===$('kind').value)); button.addEventListener('click',()=>{$('kind').value=choice.id; $('kind').dispatchEvent(new Event('change')); invalidate();}); $('choices').append(button); }
  for(const source of catalog.sources){ const a=document.createElement('a'); a.href=source.url; a.textContent=source.label+' ↗'; a.target='_blank'; a.rel='noopener noreferrer'; $('sources').append(a); }
  showBlank(); $('render').disabled=false; $('save-vault').disabled=false;
  $('runtime').textContent='Rust · WebAssembly 준비 완료 / 개인정보 처리에 네트워크를 사용하지 않습니다.';
  let registered=false;
  try { registered=registerPublicTools(document.modelContext, publicTools(public_catalog,public_template,{index:public_guidance_index,plan:public_response_plan})); } catch { /* manual mode remains available */ }
  $('webmcp-status').textContent=registered?'WebMCP 공개 도구 연결됨':'수동 사용 가능 · WebMCP 미연결';
} catch { $('runtime').textContent='WASM을 불러오지 못했습니다. 배포 파일을 로컬 웹 서버 또는 HTTPS에서 열어주세요.'; $('webmcp-status').textContent='WASM 로드 실패'; }
