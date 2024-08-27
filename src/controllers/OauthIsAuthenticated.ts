import { EcoContext } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks if the user is authenticated using OAuth.
 * @param {EcoContext} ctx - The context object containing information about the request.
 * @returns None
 */
export default async function OauthIsAuthenticated(ctx: EcoContext) {
  /**
   * Destructures the ecoFlow object to extract the _ and moduleConfigs properties.
   * @returns An object containing the _ and moduleConfigs properties from the ecoFlow object.
   */
  const { _, moduleConfigs } = ecoFlow;

  /**
   * Destructures the context object into its individual properties for easier access.
   * @param {object} ctx - The context object containing payload, inputs, request, and next properties.
   * @returns None
   */
  const { payload, inputs, request, next } = ctx;

  /**
   * Checks if the inputs object is empty or undefined, and sets an error message in the payload if so.
   * @param {object} inputs - The inputs object to check.
   * @param {object} payload - The payload object to update with an error message if inputs are missing.
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
   * Checks if the client object is missing or empty, and sets an error message in the payload if so.
   * @param {object} inputs - An object containing client information.
   * @returns None
   */
  const { client } = inputs;
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
   * Selects the configuration manager for the "ecoflow-supabase" package and checks if it exists.
   * If the configuration manager does not exist, it sets an error message in the payload object.
   * @returns None
   */
  const configManager = moduleConfigs.selectPackage("ecoflow-supabase");
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
   * Extracts the token from the authorization header in the request and checks if it is valid.
   * If the token is missing or empty, it sets the response status to 401 and returns an error message.
   * @param {Request} request - The request object containing the headers.
   * @param {Context} ctx - The context object to set the response status and payload.
   * @returns None
   */
  const token = request.headers.authorization?.split(" ")[1];
  if (_.isUndefined(token) || _.isEmpty(token)) {
    ctx.status = 401;
    payload.msg = {
      authenticated: false,
      message: "Missing or invalid authorization token",
    };
    return;
  }

  /**
   * Retrieves user data and error information from Supabase authentication using the provided token.
   * @param {string} token - The authentication token used to retrieve user data.
   * @returns An object containing the user data and any potential errors.
   */
  const { data, error } = await supabase.auth.getUser(token);

  /**
   * If an error is present, set the status to 401, construct an error message object,
   * and return without further execution.
   * @param {Error} error - The error object to handle
   * @returns None
   */
  if (error) {
    ctx.status = 401;
    payload.msg = {
      authenticated: false,
      message: error.message,
      rawError: error,
    };
    return;
  }

  /**
   * Checks if the data object is not null and contains a user property. If so, sets the payload message
   * to indicate authentication and includes the user data. Calls the next middleware function.
   * @param {object} data - The data object to check for user authentication.
   * @param {function} next - The next middleware function to call.
   * @returns None
   */
  if (data && data.user !== null) {
    payload.msg = {
      authenticated: true,
      user: data.user,
    };
    next();
    return;
  }

  /**
   * Sets the status to 401, constructs a message payload with authenticated set to false and user set to null,
   * and then returns from the function.
   * @returns None
   */
  ctx.status = 401;
  payload.msg = {
    authenticated: false,
    user: null,
  };
  return;
}
