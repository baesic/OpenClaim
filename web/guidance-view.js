// This module only renders a public playbook. It never reads the private form.
export function renderGuidance(root, plan) {
  const node=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
  const list=values=>{const ul=document.createElement('ul');for(const text of values)ul.append(node('li',text));return ul;};
  const group=(title,values)=>{const section=document.createElement('article');section.append(node('h3',title),list(values));return section;};
  root.replaceChildren();
  root.append(node('h3',plan.scenario.title),node('p',plan.scenario.summary));
  if(plan.scenario.urgency==='urgent'){const urgent=node('p','긴급 금전 피해: 이메일 답변이나 문서 작성을 기다리지 말고 112·해당 금융회사의 공식 연락처로 지급정지를 직접 요청하세요.');urgent.className='notice';root.append(urgent);}
  const options=group('선택할 수 있는 대응',plan.scenario.actions.map(a=>`${a.title} — ${a.detail}`));
  root.append(options,group('로컬에서 준비할 증빙',plan.scenario.evidence),group('본인이 요청할 수 있는 내용',plan.scenario.suggested_requests),group('확인할 한계',plan.scenario.cautions));
  if(plan.incident_context){const i=plan.incident_context;const section=document.createElement('article');section.append(node('h3',i.title),node('p',i.public_summary),list(i.user_choices),list(i.cautions));root.append(section);}
  const routes=document.createElement('div');routes.className='route-grid';
  for(const route of plan.routes){const article=document.createElement('article');article.className='route-card';article.append(node('h3',route.title),node('p',route.purpose),list(route.how_to),node('p','준비: '+route.prepare.join(' · ')),node('p','비용: '+route.cost),node('p','유의: '+route.limits));if(route.url){const a=node('a','공식 안내 열기 ↗');a.href=route.url;a.target='_blank';a.rel='noopener noreferrer';article.append(a);}routes.append(article);}
  root.append(node('h3','목적에 맞는 공식 창구'),routes,node('p',plan.cost_policy));
  const sources=document.createElement('details');sources.append(node('summary',`근거와 확인 날짜 (${plan.as_of} 기준 · 재검토 예정 ${plan.review_due})`));
  for(const source of plan.sources){const p=document.createElement('p');const a=node('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a,node('span',` — ${source.checked_on} 확인. ${source.supports}`));sources.append(p);}
  sources.append(node('p',plan.notice));root.append(sources);
}
