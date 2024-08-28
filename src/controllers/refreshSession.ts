import { EcoContext } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Asynchronously refreshes the session using the provided EcoContext.
 * @param {EcoContext} ctx - The EcoContext object containing the context information.
 * @returns None
 */
export default async function refreshSession(ctx: EcoContext) {
  /**
   * Destructures the _ and moduleConfigs properties from the ecoFlow object.
   * @returns An object containing the _ and moduleConfigs properties.
   */
  const { _, moduleConfigs } = ecoFlow;

  /**
   * Destructures the context object into payload, inputs, and next variables.
   * @param {object} ctx - The context object to destructure.
   * @returns None
   */
  const { payload, inputs, next } = ctx;

  /**
   * Checks if the inputs object is empty or undefined. If so, sets an error message in the payload object.
   * @param {object} inputs - The inputs object to check.
   * @returns None
   */
  if (!inputs || _.isEmpty(inputs)) {
    payload.msg = {
      error: true,
      message: "Missing inputs.",
    };
    return;
  }

  /**
   * Destructures the inputs object to extract client, refreshToken, and passByPayload properties.
   * @param {object} inputs - The inputs object containing client, refreshToken, and passByPayload properties.
   * @returns None
   */
  const { client, refreshToken, passByPayload } = inputs;

  /**
   * Checks if the client object is missing or empty, and sets an error message in the payload if so.
   * @param {object} client - The client object to check.
   * @returns None
   */
  if (!client || _.isEmpty(client)) {
    payload.msg = {
      error: true,
      message: "Missing client.",
      status: {
        client: _.isUndefined(client),
      },
    };
    return;
  }

  /**
   * Checks if a refresh token is missing or invalid, and updates the payload message accordingly.
   * @param {boolean} passByPayload - Flag indicating whether the token is passed by payload.
   * @param {string} payload - The payload object containing the token.
   * @param {string} refreshToken - The refresh token to be checked.
   * @param {string} client - The client information.
   * @returns None
   */
  const token = passByPayload ? payload[refreshToken] : refreshToken;
  if (_.isUndefined(token) || _.isEmpty(token)) {
    payload.msg = {
      error: true,
      message: "Missing or invalid refresh token.",
      status: {
        client: _.isUndefined(client),
        actualToken: token,
        refreshToken: _.isUndefined(refreshToken),
        passByPayload: _.isUndefined(passByPayload),
      },
    };
    return;
  }

  /**
   * Selects the configuration manager for the "ecoflow-supabase-auth" package and checks if it exists.
   * If the configuration manager does not exist, it sets an error message in the payload object.
   * @returns None
   */
  const configManager = moduleConfigs.selectPackage("ecoflow-supabase-auth");
  if (!configManager || _.isUndefined(configManager)) {
    payload.msg = {
      error: true,
      message: "Missing configs manager for ecoflow-supabase package",
    };
    return;
  }

  /**
   * Retrieves the configuration for the client using the configManager.
   * If the configuration is null or empty, it sets an error message in the payload.
   * @param {Client} client - The client for which the configuration is retrieved.
   * @returns None
   */
  const config = configManager.get(client);
  if (_.isNull(config) || _.isEmpty(config)) {
    payload.msg = {
      error: true,
      message: "Missing config for ecoflow-supabase package",
    };
    return;
  }

  /**
   * Checks if the Supabase client is provided in the configuration and handles the case where it is missing.
   * @param {object} config - The configuration object containing the Supabase client.
   * @returns None
   */
  const supabase = config.configs as SupabaseClient<any, "public", any>;
  if (_.isNull(supabase) || _.isEmpty(supabase)) {
    payload.msg = {
      error: true,
      message: "Missing supabase client",
    };
    return;
  }

  /**
   * Refreshes the current user session using the provided refresh token.
   * @param {string} token - The refresh token used to refresh the session.
   * @returns An object containing the refreshed session data and any potential errors.
   */
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: token,
  });

  /**
   * If an error is present, set the status to 404, construct a message object with the error message and raw error,
   * and return from the function.
   * @param {Error} error - The error object to handle
   * @returns None
   */
  if (error) {
    ctx.status = 404;
    payload.msg = {
      message: error.message,
      rawError: error,
    };
    return;
  }

  /**
   * Checks if the data object contains session and user properties, then constructs a payload message
   * with authentication details and calls the next middleware function.
   * @param {object} data - The data object containing session and user properties.
   * @param {function} next - The callback function to call the next middleware.
   * @returns None
   */
  if (data && data.session && data.user) {
    payload.msg = {
      authenticated: data.session ? true : false,
      user: data.user,
      session: data.session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
    next();
    return;
  }

  /**
   * Sets an error message in the payload object and returns.
   * @returns None
   */
  payload.msg = {
    error: true,
    message: "Failed to refresh session",
  };
  return;
}
