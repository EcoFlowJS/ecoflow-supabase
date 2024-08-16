import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the provided project URL and API key.
 * @param {string} projectURL - The URL of the Supabase project.
 * @param {string} apiKey - The API key for the Supabase project.
 * @returns {SupabaseClient<any, "public", any>} A Supabase client instance.
 */
export default function supabaseClient(
  projectURL: string,
  apiKey: string
): SupabaseClient<any, "public", any> {
  /**
   * Creates a client with the given project URL, API key, and authentication configuration.
   * @param {string} projectURL - The URL of the project.
   * @param {string} apiKey - The API key for authentication.
   * @param {object} options - Additional options for client configuration.
   * @param {object} options.auth - Authentication configuration object.
   * @param {string} options.auth.flowType - The flow type for authentication (e.g., "pkce").
   * @returns The created client.
   */
  return createClient(projectURL, apiKey, {
    auth: {
      flowType: "pkce",
    },
  });
}
