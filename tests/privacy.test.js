import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encryptVault, decryptVault} from '../web/vault.js';
import {publicTools, registerPublicTools} from '../web/public-tools.js';

test('encrypted backup round-trips, hides plaintext and rejects wrong passwords and tampering',async()=>{
  const value={fields:{name:'SYNTHETIC_PRIVATE_SENTINEL'},version:1};
  const pass='synthetic password for test';
  const text=await encryptVault(value,pass);
  assert.ok(!text.includes(value.fields.name));
  assert.deepEqual(await decryptVault(text,pass),value);
  await assert.rejects(()=>decryptVault(text,'wrong password for test'));
  const broken=JSON.parse(text); broken.data=(broken.data[0]==='A'?'B':'A')+broken.data.slice(1);
  await assert.rejects(()=>decryptVault(JSON.stringify(broken),pass));
  await assert.rejects(()=>encryptVault(value,'short'));
});

test('WebMCP works with feature detection and cannot read private form data',async()=>{
  const guide={index:()=>JSON.stringify({scenarios:[{id:'notice_only'}],incidents:[{id:'public_incident'}]}),plan:(scenario,incident)=>JSON.stringify({scenario,incident})};
  const tools=publicTools(()=>'{"choices":["inquiry"]}',kind=>`blank:${kind}`,guide);
  assert.equal(registerPublicTools(undefined,tools),false);
  const registered=[];
  assert.equal(registerPublicTools({registerTool:t=>registered.push(t)},tools),true);
  assert.equal(registered.length,4);
  assert.deepEqual(await tools[0].execute({}),{choices:['inquiry']});
  assert.ok((await tools[0].execute({name:'private'})).error);
  assert.deepEqual(await tools[1].execute({kind:'inquiry'}),{template:'blank:inquiry'});
  assert.ok((await tools[1].execute({kind:'inquiry',name:'private'})).error);
  assert.ok((await tools[1].execute({kind:'send_email'})).error);
  assert.ok((await tools[2].execute({facts:'private'})).error);
  assert.deepEqual(await tools[3].execute({scenario:'notice_only'}),{scenario:'notice_only',incident:'generic'});
  assert.deepEqual(await tools[3].execute({scenario:'notice_only',incident:'public_incident'}),{scenario:'notice_only',incident:'public_incident'});
  assert.ok((await tools[3].execute({scenario:'notice_only',facts:'private'})).error);
  assert.ok((await tools[3].execute({scenario:'unknown'})).error);
  assert.ok((await tools[3].execute({scenario:'notice_only',incident:'private case text'})).error);
  assert.ok((await tools[3].execute(null)).error);
});
