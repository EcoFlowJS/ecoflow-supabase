import { EcoContext } from "@ecoflow/types";
import callbackController from "./callbackController";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function OauthController(ctx: EcoContext) {
  const { _, log, server, router, moduleConfigs } = ecoFlow;

  const { payload, inputs, next } = ctx;

  if (!inputs || _.isEmpty(inputs)) {
    payload.msg = {
      error: true,
      message: "Missing inputs.",
    };
    return;
  }

  const { client, provider, callbackURL } = inputs;

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

  const configManager = moduleConfigs.selectPackage("ecoflow-supabase");

  if (!configManager || _.isUndefined(configManager)) {
    payload.msg = {
      error: true,
      message: "Missing configs manager for ecoflow-supabase package",
    };
    return;
  }

  const config = configManager.get(client);

  if (_.isNull(config) || _.isEmpty(config)) {
    payload.msg = {
      error: true,
      message: "Missing config for ecoflow-supabase package",
    };
    return;
  }

  const supabase = config.configs as SupabaseClient<any, "public", any>;

  if (_.isNull(supabase) || _.isEmpty(supabase)) {
    payload.msg = {
      error: true,
      message: "Missing supabase client",
    };
    return;
  }

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

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackURL
        ? callbackURL
        : `${server.baseUrl}/api/auth/supabase/callback/${provider}`,
    },
  });

  if (error) {
    payload.msg = {
      error: true,
      message: error.message,
      rawError: error,
    };
    return;
  }

  payload.msg = {
    success: true,
    message: "Auth url generated successfully.",
    url: data.url,
    provider: data.provider,
  };

  next();
}
