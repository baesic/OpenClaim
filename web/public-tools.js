// Deliberately separate from the private workspace module: no form/DOM reads.
export function publicTools(catalog, template) {
  return [
    { name: 'openclaim_choices', description: 'List public self-claim preparation choices. Never provide private case details.', inputSchema: {type:'object', properties:{}, additionalProperties:false}, execute: async (args = {}) => {
      if (Object.keys(args).length) return {error:'No arguments accepted. Do not send personal data.'};
      return JSON.parse(catalog());
    }, annotations:{readOnlyHint:true, openWorldHint:false} },
    { name:'openclaim_template', description:'Get a blank Korean request template for the user to fill locally. Does not read a draft or submit a claim.', inputSchema:{type:'object',properties:{kind:{type:'string',enum:['inquiry','compensation','mediation']}},required:['kind'],additionalProperties:false}, execute: async (args) => {
      if (!args || Object.keys(args).length !== 1 || !['inquiry','compensation','mediation'].includes(args.kind)) return {error:'Choose a public template identifier only.'};
      return {template:template(args.kind)};
    }, annotations:{readOnlyHint:true,openWorldHint:false} }
  ];
}

export function registerPublicTools(context, tools) {
  if (!context || typeof context.registerTool !== 'function') return false;
  for (const tool of tools) context.registerTool(tool);
  return true;
}
