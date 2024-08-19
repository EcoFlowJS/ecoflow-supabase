import { EcoContext } from "@ecoflow/types";
import supabaseClient from "../helpers/supabaseClient";

/**
 * Asynchronously refreshes the session using the provided EcoContext.
 * @param {EcoContext} ctx - The EcoContext object containing the context information.
 * @returns None
 */
export default async function refreshSession(ctx: EcoContext) {
  /**
   * Destructures the "_" property from the ecoFlow object.
   * @param {object} ecoFlow - The ecoFlow object
   * @returns None
   */
  const { _ } = ecoFlow;

  /**
   * Destructures the ctx object into payload, inputs, and next variables.
   * @param {object} ctx - The context object to destructure
   * @returns None
   */
  const { payload, inputs, next } = ctx;

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
   * Destructures the inputs object to extract projectURL, apiKey, apiKeyFromEnv, refreshToken, and passByPayload.
   * @param {object} inputs - An object containing projectURL, apiKey, apiKeyFromEnv, refreshToken, and passByPayload.
   * @returns None
   */
  const { projectURL, apiKey, apiKeyFromEnv, refreshToken, passByPayload } =
    inputs;

  /**
   * Checks if the project URL is missing or empty, and sets an error message if it is.
   * @param {string} projectURL - The project URL to check.
   * @param {string} apiKey - The API key.
   * @param {string} apiKeyFromEnv - The API key from environment variables.
   * @param {string} refreshToken - The refresh token.
   * @param {string} passByPayload - The pass by payload.
   * @param {object} payload - The payload object to update with error message if project URL is missing.
   * @returns None
   */
  if (!projectURL || _.isEmpty(projectURL)) {
    payload.msg = {
      error: true,
      message: "Missing project URL.",
      status: {
        projectURL: _.isUndefined(projectURL),
        apiKey: _.isUndefined(apiKey),
        apiKeyFromEnv: _.isUndefined(apiKeyFromEnv),
        refreshToken: _.isUndefined(refreshToken),
        passByPayload: _.isUndefined(passByPayload),
      },
    };
    return;
  }

  /**
   * Retrieves the Supabase API key based on the provided apiKey parameter and environment variables.
   * @param {string} apiKey - The API key to use, if not undefined.
   * @returns {string} The Supabase API key to be used.
   */
  const supabaseApiKey: string = _.isUndefined(apiKey)
    ? process.env.ECOFLOW_USER_SUPABASE_API_KEY
    : apiKeyFromEnv
    ? process.env[apiKey]
    : apiKey;

  /**
   * Checks if the Supabase API key is undefined and sets an error message in the payload object if it is.
   * @param {any} supabaseApiKey - The Supabase API key to check.
   * @returns None
   */
  if (_.isUndefined(supabaseApiKey)) {
    payload.msg = {
      error: true,
      message: "Missing API Key.",
      status: {
        projectURL: _.isUndefined(projectURL),
        apiKey: _.isUndefined(apiKey),
        supabaseApiKey: _.isUndefined(supabaseApiKey),
        apiKeyFromEnv: _.isUndefined(apiKeyFromEnv),
        refreshToken: _.isUndefined(refreshToken),
        passByPayload: _.isUndefined(passByPayload),
      },
    };
    return;
  }

  /**
   * Retrieves the token based on the value of passByPayload.
   * If passByPayload is true, the token is retrieved from the payload object.
   * If passByPayload is false, the token is retrieved directly.
   * @param {boolean} passByPayload - Determines whether to retrieve the token from the payload object.
   * @param {string} payload - The payload object containing the token.
   * @param {string} refreshToken - The refresh token.
   * @returns The token value based on the passByPayload condition.
   */
  const token = passByPayload ? payload[refreshToken] : refreshToken;

  /**
   * Checks if the token is undefined or empty, and sets an error message if it is.
   * @param {any} token - The token to check for validity.
   * @param {object} payload - The payload object to update with error message.
   * @param {string} projectURL - The project URL to check for validity.
   * @param {string} apiKey - The API key to check for validity.
   * @param {string} supabaseApiKey - The Supabase API key to check for validity.
   * @param {string} apiKeyFromEnv - The API key from environment to check for validity.
   * @param {string} refreshToken - The refresh token to check for validity.
   * @param {string} passByPayload - The payload value to pass by key.
   * @returns None
   */
  if (_.isUndefined(token) || _.isEmpty(token)) {
    payload.msg = {
      error: true,
      message: "Missing or invalid refresh token.",
      status: {
        projectURL: _.isUndefined(projectURL),
        apiKey: _.isUndefined(apiKey),
        supabaseApiKey: _.isUndefined(supabaseApiKey),
        apiKeyFromEnv: _.isUndefined(apiKeyFromEnv),
        refreshToken: _.isUndefined(refreshToken),
        passByPayload: _.isUndefined(passByPayload),
      },
    };
    return;
  }

  /**
   * Creates a Supabase client instance with the provided project URL and API key.
   * @param {string} projectURL - The URL of the Supabase project.
   * @param {string} supabaseApiKey - The API key for the Supabase project.
   * @returns A Supabase client instance.
   */
  const clientSupabase = supabaseClient(projectURL, supabaseApiKey);

  /**
   * Checks if the Supabase client is undefined or empty, and sets an error message in the payload if so.
   * @param {any} clientSupabase - The Supabase client object to check.
   * @param {object} payload - The payload object to update with an error message if needed.
   * @returns None
   */
  if (_.isUndefined(clientSupabase) || _.isEmpty(clientSupabase)) {
    payload.msg = {
      error: true,
      message: "Missing supabase client",
    };
    return;
  }

  /**
   * Refreshes the user session using the provided refresh token.
   * @param {string} token - The refresh token used to refresh the session.
   * @returns An object containing the refreshed session data and any error that occurred during the refresh.
   */
  const { data, error } = await clientSupabase.auth.refreshSession({
    refresh_token: token,
  });

  /**
   * If an error is present, set the status to 404, construct an error message object
   * and return.
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
      authenticated: true,
      user: data.user,
      session: data.session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
    next();
    return;
  }

  /**
   * Assigns an error message to the payload object.
   * @param {object} payload - The payload object to which the error message is assigned.
   * @param {boolean} error - A boolean indicating if the message is an error.
   * @param {string} message - The error message to be assigned.
   * @returns None
   */
  payload.msg = {
    error: true,
    message: "Failed to refresh session",
  };
}
