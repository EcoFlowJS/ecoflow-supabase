import { EcoContext } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";
import callbackController from "./callbackController";

export default async function SignInWithOTP(ctx: EcoContext) {
  const { _, log, router, server, moduleConfigs } = ecoFlow;

  const { payload, inputs, next } = ctx;

  if (!inputs || _.isEmpty(inputs)) {
    payload.msg = {
      error: true,
      message: "Missing inputs.",
    };
    return;
  }

  const { client, email, Phone, fromPayload, payloadKey, callbackURL } = inputs;

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

  const userEmail = fromPayload
    ? payloadKey
      ? payload[payloadKey]?.email
      : payload.msg.email
    : email;
  const userPhone = fromPayload
    ? payloadKey
      ? payload[payloadKey]?.phone
      : payload.msg.email
    : Phone;

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
          path === `/api/auth/supabase/callback/OTP` && methods.includes("GET")
      ).length > 0
    )
  ) {
    log.info(`Creating callback URL: "/auth/supabase/callback/OTP"`);

    router.apiRouter.get(
      `/auth/supabase/callback/OTP`,
      async (ctx, next) => {
        ctx.query.clientConfigID = client;
        await next();
      },
      callbackController
    );
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: userEmail,
    phone: userPhone,
    options: {
      emailRedirectTo: `${server.baseUrl}/api/auth/supabase/callback/OTP`,
    },
  });

  if (error) {
    ctx.status = 400;
    payload.msg = {
      error: true,
      message: error.message,
      rawError: error,
    };
    return;
  }

  payload.msg = {
    success: true,
    message: "OTP sent successfully.",
  };

  next();
}
