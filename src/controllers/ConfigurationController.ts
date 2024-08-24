import { SupabaseClient } from "@supabase/supabase-js";
import supabaseClient from "../helpers/supabaseClient";

function ConfigurationController(
  inputs: any
): SupabaseClient<any, "public", any> | null {
  const { _, log } = ecoFlow;

  if (_.isEmpty(inputs)) {
    log.error("Missing inputs.");
    return null;
  }

  const { projectURL, apiKey, apiKeyFromEnv } = inputs;

  if (!projectURL || _.isEmpty(projectURL)) {
    log.error("Missing project URL.");
    return null;
  }

  const supabaseApiKey: string = _.isUndefined(apiKey)
    ? process.env.ECOFLOW_USER_SUPABASE_API_KEY
    : apiKeyFromEnv
    ? process.env[apiKey]
    : apiKey;

  if (!supabaseApiKey || _.isEmpty(supabaseApiKey)) {
    log.error("Missing API key.");
    return null;
  }

  return supabaseClient(projectURL, supabaseApiKey);
}

export default ConfigurationController;
