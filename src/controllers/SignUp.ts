import { EcoContext } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function Signup(ctx: EcoContext) {
  const { _, moduleConfigs } = ecoFlow;

  const { payload, inputs, next } = ctx;

  if (!inputs || _.isEmpty(inputs)) {
    payload.msg = {
      error: true,
      message: "Missing inputs.",
    };
    return;
  }

  const { client, email, Phone, password, uData, fromPayload, payloadKey } =
    inputs;

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
      : payload.msg.phone
    : Phone;
  const userPassword = fromPayload
    ? payloadKey
      ? payload[payloadKey]?.password
      : payload.msg.password
    : password;
  const userData = fromPayload
    ? payloadKey
      ? payload[payloadKey]?.uData
      : payload.msg.uData
    : uData || { value: "", validate: false };
  const captchaToken = payloadKey
    ? payload[payloadKey]?.captchaToken
    : payload.msg.captchaToken;

  const configManager = moduleConfigs.selectPackage("ecoflow-supabase-auth");
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

  const { data, error } = await supabase.auth.signUp({
    email: userEmail,
    phone: userPhone,
    password: userPassword,
    options: {
      ...(userData.validate ? { data: JSON.parse(userData.value) } : {}),
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) {
    ctx.status = 400;
    payload.msg = {
      error: true,
      Authenticated: false,
      message: error.message,
      rawError: error,
    };
    return;
  }

  ctx.status = 200;
  payload.msg = {
    success: true,
    message: "SignUp successful",
    Authenticated: data?.session ? true : false,
    user: data?.user,
    session: data?.session,
    userMetadata: data?.user?.user_metadata,
    accessToken: data?.session?.access_token,
    refreshToken: data?.session?.refresh_token,
  };

  next();
}
