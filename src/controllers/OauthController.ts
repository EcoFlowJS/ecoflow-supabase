import { EcoContext } from "@ecoflow/types";
import supabaseClient from "../helpers/supabaseClient";
import callbackController from "./callbackController";

/**
 * Handles OAuth authentication flow for the given EcoContext.
 * @param {EcoContext} ctx - The EcoContext object containing payload, inputs, and next function.
 * @returns None
 */
export default async function OauthController(ctx: EcoContext) {
  /**
   * Destructures the ecoFlow object to extract the _ , log, server, and router properties.
   * @param {Object} ecoFlow - The ecoFlow object containing _ , log, server, and router properties.
   * @returns None
   */
  const { _, log, server, router } = ecoFlow;

  /**
   * Destructures the ctx object into payload, inputs, and next variables.
   * @param {object} ctx - The context object to destructure
   * @returns None
   */
  const { payload, inputs, next } = ctx;

  /**
   * Checks if the inputs object is empty or undefined. If so, sets an error message in the payload.
   * @param {object} inputs - The inputs object to check.
   * @param {object} payload - The payload object to update with an error message.
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
   * Destructures the inputs object to extract projectURL, apiKey, apiKeyFromEnv, provider, and callbackURL.
   * @param {object} inputs - The object containing projectURL, apiKey, apiKeyFromEnv, provider, and callbackURL.
   * @returns None
   */
  const { projectURL, apiKey, apiKeyFromEnv, provider, callbackURL } = inputs;

  /**
   * Checks if the project URL is missing or empty, and sets an error message in the payload object if so.
   * @param {string} projectURL - The project URL to check.
   * @param {string} apiKey - The API key to check.
   * @param {string} apiKeyFromEnv - The API key from environment to check.
   * @param {string} provider - The provider to check.
   * @param {string} callbackURL - The callback URL to check.
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
        callbackURL: _.isUndefined(callbackURL),
      },
    };
    return;
  }

  /**
   * Retrieves the Supabase API key based on the provided apiKey or environment variables.
   * @param {string} apiKey - The API key to use, if provided.
   * @returns {string} The Supabase API key to be used.
   */
  const supabaseApiKey: string = _.isUndefined(apiKey)
    ? process.env.ECOFLOW_USER_SUPABASE_API_KEY
    : apiKeyFromEnv
    ? process.env[apiKey]
    : apiKey;

  /**
   * Checks if the Supabase API key is undefined and sets an error message in the payload object if it is.
   * @param {string} supabaseApiKey - The Supabase API key to check for undefined.
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
        callbackURL: _.isUndefined(callbackURL),
      },
    };
    return;
  }

  /**
   * Checks if the provider is missing or empty, and sets an error message with details
   * if it is.
   * @param {any} provider - the provider object to check
   * @param {string} projectURL - the project URL
   * @param {string} apiKey - the API key
   * @param {string} supabaseApiKey - the Supabase API key
   * @param {string} apiKeyFromEnv - the API key from environment
   * @param {string} callbackURL - the callback URL
   * @param {object} payload - the payload object to update with error message
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
        callbackURL: _.isUndefined(callbackURL),
      },
    };
    return;
  }

  /**
   * Initializes the Supabase client and assigns it to the global variable 'global.supabase'.
   * @param {string} projectURL - The URL of the Supabase project.
   * @param {string} supabaseApiKey - The API key for the Supabase project.
   * @returns None
   */
  global.supabase = supabaseClient(projectURL, supabaseApiKey);

  /**
   * Checks if the Supabase client is undefined or empty, and sets an error message in the payload if so.
   * @param {any} supabase - The Supabase client object to check.
   * @param {object} payload - The payload object to update with an error message.
   * @returns None
   */
  if (_.isUndefined(supabase) || _.isEmpty(supabase)) {
    payload.msg = {
      error: true,
      message: "Missing supabase client",
    };
    return;
  }

  /**
   * Checks if the callbackURL is undefined or empty and if a specific route is not already defined in the router.
   * If the conditions are met, it creates a new route in the router for the callback URL.
   * @param {string} callbackURL - The URL for the callback.
   * @param {string} provider - The provider for the callback URL.
   * @param {Router} router - The Express router object.
   * @param {Function} callbackController - The controller function for the callback route.
   * @returns None
   */
  if (
    (_.isUndefined(callbackURL) || _.isEmpty(callbackURL)) &&
    !(
      (router.apiRouter.stack as any[]).filter(
        ({ path, methods }) =>
          path === `/api/auth/supabase/callback/${provider}` &&
          methods.includes("GET")
      ).length > 0
    )
  ) {
    log.info(`Creating callback URL: "/auth/supabase/callback/${provider}"`);

    router.apiRouter.get(
      `/auth/supabase/callback/${provider}`,
      callbackController
    );
  }

  /**
   * Signs in a user with OAuth using the specified provider.
   * @param {string} provider - The OAuth provider to sign in with.
   * @param {object} options - Additional options for the sign-in process.
   * @param {string} options.redirectTo - The URL to redirect to after sign-in.
   * @returns An object containing the data and any potential errors from the sign-in process.
   */
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackURL
        ? callbackURL
        : `${server.baseUrl}/api/auth/supabase/callback/${provider}`,
    },
  });

  /**
   * Handles an error by setting the payload message to include error details.
   * @param {Error} error - The error object to handle.
   * @returns None
   */
  if (error) {
    payload.msg = {
      error: true,
      message: error.message,
      rawError: error,
    };
    return;
  }

  /**
   * Assigns a success message along with generated authentication URL and provider to the payload message object.
   * @param {object} payload - The payload object to which the message is assigned.
   * @param {string} data.url - The generated authentication URL.
   * @param {string} data.provider - The provider for the authentication.
   * @returns None
   */
  payload.msg = {
    success: true,
    message: "Auth url generated successfully.",
    url: data.url,
    provider: data.provider,
  };

  /**
   * Calls the next function in the program flow.
   * @returns None
   */
  next();
}
