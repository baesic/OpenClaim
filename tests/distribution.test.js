import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {publicTools} from '../web/public-tools.js';

const root = new URL('../dist/', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const manifest = JSON.parse(await read('service.json'));
const wasm = await import('../dist/pkg/openclaim_wasm.js');
await wasm.default({module_or_path: await readFile(new URL('pkg/openclaim_wasm_bg.wasm', root))});
const tools = publicTools(wasm.public_catalog, wasm.public_template, {index:wasm.public_guidance_index, plan:wasm.public_response_plan});

function enumValues(schema, name) {
  let value = schema.properties[name];
  if (value.$ref) value = schema.$defs[value.$ref.split('/').at(-1)];
  return [...value.enum].sort();
}

test('distribution descriptor matches the compiled native server and public WebMCP parameters', () => {
  const binary = process.env.OPENCLAIM_TEST_BINARY || fileURLToPath(new URL('../target/debug/openclaim-mcp', import.meta.url));
  const native = JSON.parse(execFileSync(binary, ['--describe'], {encoding:'utf8'}));
  assert.deepEqual(manifest, native);
  assert.equal(manifest.version, JSON.parse(wasm.public_catalog()).version);
  assert.deepEqual(manifest.tools.map(t => t.name).sort(), tools.map(t => t.name).sort());
  assert.equal(manifest.mcp.public_endpoint, null);
  assert.equal(manifest.browser.private_workspace_registers_tools, false);
  for (const tool of tools) {
    const nativeTool = manifest.tools.find(t => t.name === tool.name);
    assert.equal(nativeTool.annotations.readOnlyHint, true);
    assert.equal(nativeTool.inputSchema.additionalProperties, false);
    assert.deepEqual(Object.keys(nativeTool.inputSchema.properties ?? {}).sort(), Object.keys(tool.inputSchema.properties).sort());
    for (const name of Object.keys(tool.inputSchema.properties)) {
      assert.deepEqual(enumValues(nativeTool.inputSchema, name), enumValues(tool.inputSchema, name));
    }
  }
});

test('all bundled public playbooks and templates execute through the shipped WASM tool boundary', async () => {
  const get = name => tools.find(t => t.name === name);
  const index = await get('openclaim_guidance_index').execute({});
  for (const scenario of index.scenarios) for (const incident of ['generic', ...index.incidents.map(i => i.id)]) {
    const plan = await get('openclaim_response_plan').execute({scenario:scenario.id, incident});
    assert.equal(plan.scenario.id, scenario.id);
    assert.ok(plan.routes.length && plan.sources.length);
    assert.equal(plan.as_of, manifest.guidance.as_of);
  }
  for (const kind of ['inquiry','compensation','mediation']) {
    const result = await get('openclaim_template').execute({kind});
    assert.equal(result.template, wasm.public_template(kind));
  }
  for (const tool of tools) {
    const result = await tool.execute({name:'SYNTHETIC_PRIVATE_SENTINEL'});
    assert.ok(result.error);
    assert.ok(!JSON.stringify(result).includes('SYNTHETIC_PRIVATE_SENTINEL'));
  }
});

test('service and public runtime have no private intake, and shipped HTML links resolve', async () => {
  for (const file of ['index.html', 'browser.html']) {
    const html = await read(file);
    assert.doesNotMatch(html, /<(?:form|input|textarea)\b/i);
    if (file === 'index.html') assert.doesNotMatch(html, /<script\b/i);
  }
  for (const file of ['index.html', 'browser.html', 'workspace.html']) {
    const html = await read(file);
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|data:)/.test(href)) continue;
      if (href.startsWith('#')) { assert.ok(ids.has(href.slice(1)), `${file}: missing ${href}`); continue; }
      const path = href.split('#')[0];
      await access(new URL(path, root));
      if (href.includes('#')) {
        const target = await read(path);
        assert.ok(target.includes(`id="${href.split('#')[1]}"`), `${file}: missing target ${href}`);
      }
    }
  }
  // A private draft must not silently join the Agent-facing WebMCP surface.
  const privateModule = await read('app.js');
  assert.doesNotMatch(privateModule, /(?:modelContext|registerPublicTools|public-tools\.js)/);
  const publicModule = await read('browser.js');
  assert.doesNotMatch(publicModule, /(?:local_draft|vault\.js|app\.js)/);
  for (const file of ['SKILL.md', 'references/response-guide.md', 'references/templates.md', 'references/integration.md', 'references/modes.md']) {
    await access(new URL(`skill/${file}`, root));
  }
});
