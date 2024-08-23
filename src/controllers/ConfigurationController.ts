import supabaseClient from "../helpers/supabaseClient";

function ConfigurationController(ctx: any) {
  const { _, log } = ecoFlow;

  if (_.isEmpty(ctx)) return;

  const { id, global, inputs } = ctx;

  if (_.isEmpty(inputs)) return log.error("Missing inputs.");

  const { projectURL, apiKey, apiKeyFromEnv } = inputs;

  if (_.isEmpty(id)) return;

  if (!projectURL || _.isEmpty(projectURL))
    return log.error("Missing project URL.");

  const supabaseApiKey: string = _.isUndefined(apiKey)
    ? process.env.ECOFLOW_USER_SUPABASE_API_KEY
    : apiKeyFromEnv
    ? process.env[apiKey]
    : apiKey;

  if (!supabaseApiKey || _.isEmpty(supabaseApiKey))
    return log.error("Missing API key.");

  global[id] = supabaseClient(projectURL, supabaseApiKey);
}

export default ConfigurationController;
