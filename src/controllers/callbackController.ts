import { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { Context } from "koa";
import {
  ExchangeCodeForSessionData,
  ExchangeCodeForSessionDataNull,
  ExchangeCodeForSessionResponse,
} from "../interface/ExchangeCodeForSessionResponse";

const exchangeCodeForSession = async (
  supabase: SupabaseClient<any, "public", any>,
  code: string
): Promise<ExchangeCodeForSessionResponse> => {
  let error: AuthError | null = null;

  let data: ExchangeCodeForSessionData | ExchangeCodeForSessionDataNull = {
    user: null,
    session: null,
  };

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    data = sessionData;
    error = sessionError;
  } catch (exchangeError: any) {
    error = exchangeError;
  }

  return { data, error };
};

export default async function callbackController(ctx: Context) {
  const { _, moduleConfigs } = ecoFlow;

  const { code, next, clientConfigID } = ctx.query;

  if (!code) {
    ctx.body = {
      error: true,
      message: "No code provided",
    };
    return;
  }

  if (!clientConfigID) {
    ctx.body = {
      error: true,
      message: "Missing client Config ID.",
    };
    return;
  }

  const configManager = moduleConfigs.selectPackage("ecoflow-supabase-auth");

  if (!configManager || _.isUndefined(configManager)) {
    ctx.body = {
      msg: {
        error: true,
        message: "Missing configs manager for ecoflow-supabase package",
      },
    };
    return;
  }

  const config = configManager.get(clientConfigID as string);

  if (_.isNull(config) || _.isEmpty(config)) {
    ctx.body = {
      msg: {
        error: true,
        message: "Missing config for ecoflow-supabase package",
      },
    };
    return;
  }

  const supabase = config.configs as SupabaseClient<any, "public", any>;

  if (_.isNull(supabase) || _.isEmpty(supabase)) {
    ctx.body = {
      msg: {
        error: true,
        message: "Missing supabase client",
      },
    };
    return;
  }

  const { data, error } = await exchangeCodeForSession(
    supabase,
    code as string
  );

  if (error) {
    ctx.body = {
      msg: {
        error: true,
        message: error.message,
        rawError: error,
      },
    };
    return;
  }

  ctx.body = {
    msg: {
      success: true,
      message: "Authentication successful",
      user: data?.user,
      session: data?.session,
      userMetadata: data?.user?.user_metadata,
      ...(next ? { redirect_url: next } : {}),
    },
  };
}
