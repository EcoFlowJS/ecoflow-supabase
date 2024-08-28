import { EcoContext } from "@ecoflow/types";
import callbackController from "./callbackController";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function OauthController(ctx: EcoContext) {
  /**
   * Destructures the ecoFlow object to extract the _, log, server, router, and moduleConfigs properties.
   * @param {Object} ecoFlow - The ecoFlow object containing properties to destructure.
   * @returns None
   */
  const { _, log, server, router, moduleConfigs } = ecoFlow;

  /**
   * Destructures the ctx object into payload, inputs, and next variables.
   * @param {object} ctx - The context object to destructure
   * @returns None
   */
  const { payload, inputs, next } = ctx;

  /**
   * Checks if the inputs object is empty or undefined, and sets an error message in the payload if so.
   * @param {object} inputs - The inputs object to check.
   * @param {object} payload - The payload object to set the error message in.
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
   * Destructures the inputs object to extract client, provider, and callbackURL properties.
   * @param {object} inputs - The object containing client, provider, and callbackURL properties.
   * @returns None
   */
  const { client, provider, callbackURL } = inputs;

  /**
   * Checks if the client object is missing or empty, and sets an error message in the payload if so.
   * @param {object} client - The client object to check.
   * @param {object} provider - The provider object to check.
   * @param {string} callbackURL - The callback URL to check.
   * @param {object} payload - The payload object to update with error message.
   * @returns None
   */
  if (!client || _.isEmpty(client)) {
    payload.msg = {
      error: true,
      message: "Missing client.",
      status: {
        client: _.isUndefined(client),
        provider: _.isUndefined(provider),
        callbackURL: _.isUndefined(callbackURL),
      },
    };
    return;
  }

  /**
   * Checks if the provider is missing or empty, and sets an error message if so.
   * @param {any} provider - The provider object to check.
   * @returns None
   */
  if (!provider || _.isEmpty(provider)) {
    payload.msg = {
      error: true,
      message: "Missing provider.",
      status: {
        client: _.isUndefined(client),
        provider: _.isUndefined(provider),
        callbackURL: _.isUndefined(callbackURL),
      },
    };
    return;
  }

  /**
   * Selects the configuration manager for the "ecoflow-supabase-auth" package and checks if it exists.
   * If the configuration manager does not exist, an error message is added to the payload.
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
   * Checks if the callback URL is undefined or empty and if the specified route does not already exist in the API router stack.
   * If the conditions are met, it creates a new route in the API router for the callback URL.
   * @param {string} callbackURL - The callback URL to check and potentially create.
   * @param {string} provider - The provider for the callback URL.
   * @param {Router} router - The router object containing the API routes.
   * @param {string} client - The client configuration ID.
   * @param {Function} callbackController - The controller function to handle the callback.
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
      async (ctx, next) => {
        ctx.query.clientConfigID = client;
        await next();
      },
      callbackController
    );
  }

  /**
   * Sign in with OAuth using the specified provider.
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
   * Checks if an error exists and updates the payload message accordingly.
   * @param {Error} error - The error object to check.
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
   * Assigns a success message along with the generated authentication URL and provider to the payload message object.
   * @param {object} payload - The payload object to which the message is being assigned.
   * @param {string} data.url - The generated authentication URL.
   * @param {string} data.provider - The provider associated with the authentication URL.
   * @returns None
   */
  payload.msg = {
    success: true,
    message: "Auth url generated successfully.",
    url: data.url,
    provider: data.provider,
  };

  next();
}
