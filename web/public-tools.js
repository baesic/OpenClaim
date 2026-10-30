// Deliberately separate from the private workspace module: no form/DOM reads.
export function publicTools(catalog, template, guidance) {
  const index = JSON.parse(guidance.index());
  const scenarios = index.scenarios.map(s => s.id);
  const incidents = ['generic', ...index.incidents.map(i => i.id)];
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  return [
    { name: 'openclaim_choices', description: 'List public self-claim preparation choices. Never provide private case details.', inputSchema: {type:'object', properties:{}, additionalProperties:false}, execute: async (args = {}) => {
      if (!record(args) || Object.keys(args).length) return {error:'No arguments accepted. Do not send personal data.'};
      return JSON.parse(catalog());
    }, annotations:{readOnlyHint:true, openWorldHint:false} },
    { name:'openclaim_template', description:'Get a blank Korean request template for the user to fill locally. Does not read a draft or submit a claim.', inputSchema:{type:'object',properties:{kind:{type:'string',enum:['inquiry','compensation','mediation']}},required:['kind'],additionalProperties:false}, execute: async (args) => {
      if (!record(args) || Object.keys(args).length !== 1 || !['inquiry','compensation','mediation'].includes(args.kind)) return {error:'Choose a public template identifier only.'};
      return {template:template(args.kind)};
    }, annotations:{readOnlyHint:true,openWorldHint:false} },
    {name:'openclaim_guidance_index', description:'Discover public Korean breach response playbooks, agency application routes, public incident IDs and source dates. Does not inspect a private case.', inputSchema:{type:'object',properties:{},additionalProperties:false}, execute:async (args={})=>{
      if (!record(args) || Object.keys(args).length) return {error:'No arguments accepted. Do not send personal data.'};
      return JSON.parse(guidance.index());
    }, annotations:{readOnlyHint:true,openWorldHint:false}},
    {name:'openclaim_response_plan',description:'Get public response options, evidence checklists, agency-specific application guidance, cost notes and sources. Select a playbook; no eligibility decision or submission is performed.',inputSchema:{type:'object',properties:{scenario:{type:'string',enum:scenarios},incident:{type:'string',enum:incidents,default:'generic'}},required:['scenario'],additionalProperties:false},execute:async args=>{
      if(!record(args) || Object.keys(args).some(k=>!['scenario','incident'].includes(k)) || !scenarios.includes(args.scenario) || !incidents.includes(args.incident ?? 'generic')) return {error:'Choose public playbook and incident identifiers only.'};
      return JSON.parse(guidance.plan(args.scenario,args.incident ?? 'generic'));
    },annotations:{readOnlyHint:true,openWorldHint:false}}
  ];
}

export function registerPublicTools(context, tools) {
  if (!context || typeof context.registerTool !== 'function') return false;
  for (const tool of tools) context.registerTool(tool);
  return true;
}
