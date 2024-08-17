import { EcoContext } from "@ecoflow/types";
import supabaseClient from "../helpers/supabaseClient";

export default async function OauthIsAuthenticated(ctx: EcoContext) {
  /**
   * Destructures the "_" property from the ecoFlow object.
   * @param {Object} ecoFlow - The ecoFlow object containing the "_" property.
   * @returns None
   */
  const { _ } = ecoFlow;

  /**
   * Destructures the ctx object into payload, inputs, and next variables.
   * @param {object} ctx - The context object to destructure.
   * @returns None
   */
  const { payload, inputs, request, next } = ctx;

  /**
   * Checks if the inputs object is empty or undefined. If so, sets an error message in the payload object.
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
   * Destructures the inputs object to extract projectURL, apiKey, apiKeyFromEnv, and provider.
   * @param {object} inputs - The object containing projectURL, apiKey, apiKeyFromEnv, and provider.
   * @returns None
   */
  const { projectURL, apiKey, apiKeyFromEnv, provider } = inputs;

  /**
   * Checks if the project URL is missing or empty, and sets an error message in the payload object if so.
   * @param {string} projectURL - The project URL to check.
   * @param {string} apiKey - The API key to check.
   * @param {string} apiKeyFromEnv - The API key from environment to check.
   * @param {string} provider - The provider to check.
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
        provider: _.isUndefined(provider),
      },
    };
    return;
  }

  /**
   * Retrieves the Supabase API key based on the provided apiKey or environment variables.
   * @param {string} apiKey - The API key to use, if provided.
   * @param {string} apiKeyFromEnv - The environment variable name for the API key.
   * @returns {string} The Supabase API key to be used.
   */
  const supabaseApiKey: string = _.isUndefined(apiKey)
    ? process.env.ECOFLOW_USER_SUPABASE_API_KEY
    : apiKeyFromEnv
    ? process.env[apiKey]
    : apiKey;

  /**
   * Checks if the Supabase API key is undefined and sets an error message in the payload object if it is.
   * @param {string} supabaseApiKey - The Supabase API key to check.
   * @param {object} payload - The payload object to update with error message if API key is missing.
   * @param {string} projectURL - The project URL.
   * @param {string} apiKey - The API key.
   * @param {string} apiKeyFromEnv - The API key from environment variables.
   * @param {string} provider - The provider.
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
        provider: _.isUndefined(provider),
      },
    };
    return;
  }

  /**
   * Checks if the provider is missing or empty, and sets an error message in the payload object if so.
   * @param {any} provider - The provider object to check.
   * @returns None
   */
  if (!provider || _.isEmpty(provider)) {
    payload.msg = {
      error: true,
      message: "Missing provider.",
      status: {
        projectURL: _.isUndefined(projectURL),
        apiKey: _.isUndefined(apiKey),
        supabaseApiKey: _.isUndefined(supabaseApiKey),
        apiKeyFromEnv: _.isUndefined(apiKeyFromEnv),
        provider: _.isUndefined(provider),
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
   * Extracts the token from the Authorization header in the request.
   * @param {Request} request - The request object containing headers.
   * @returns The extracted token or undefined if not found.
   */
  const token = request.headers.authorization?.split(" ")[1];

  /**
   * Checks if the token is undefined or empty. If so, sets the status to 401,
   * updates the payload message, and returns.
   * @param {any} token - The token to check for validity.
   * @returns None
   */
  if (_.isUndefined(token) || _.isEmpty(token)) {
    ctx.status = 401;
    payload.msg = {
      authenticated: false,
      message: "Missing or invalid authorization token",
    };
    return;
  }

  /**
   * Retrieves user data and potential errors from Supabase using the provided token.
   * @param {string} token - The authentication token for the user.
   * @returns An object containing the user data and any potential errors.
   */
  const { data, error } = await clientSupabase.auth.getUser(token);

  /**
   * Handles the error by setting the status to 401, constructing an error message object,
   * and returning early from the function.
   * @param {Error} error - The error object that occurred.
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
   * @param {object} data - The data object to check for user property.
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
   * Sets the status code to 401 and constructs a message payload with authentication details.
   * @param {object} ctx - The context object containing information about the request and response.
   * @param {object} payload - The payload object to be sent as a response message.
   * @returns None
   */
  ctx.status = 401;
  payload.msg = {
    authenticated: false,
    user: null,
  };

  /**
   * Calls the next function in the program flow.
   * @returns None
   */
  next();
}
