import { EcoContext } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

export default async function SignInWithPassword(ctx: EcoContext) {
  /**
   * Destructures the ecoFlow object to extract the _ and moduleConfigs properties.
   * @returns An object containing the _ and moduleConfigs properties from the ecoFlow object.
   */
  const { _, moduleConfigs } = ecoFlow;

  /**
   * Destructures the properties 'payload', 'inputs', and 'next' from the given context object.
   * @param {object} ctx - The context object containing the properties to destructure.
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
   * Destructures the inputs object to extract client, email, Phone, password, fromPayload, and payloadKey.
   * @param {Object} inputs - The object containing client, email, Phone, password, fromPayload, and payloadKey.
   * @returns None
   */
  const { client, email, Phone, password, fromPayload, payloadKey } = inputs;

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
   * Assigns values to user email, phone, password, and captcha token based on the payload object.
   * @param {boolean} fromPayload - Indicates whether the values should be taken from the payload object.
   * @param {string} payloadKey - The key in the payload object to access the user data.
   * @param {object} payload - The payload object containing user data.
   * @param {string} email - The default email value if not found in the payload.
   * @param {string} Phone - The default phone value if not found in the payload.
   * @param {string} password - The default password value if not found in the payload.
   * @returns None
   */
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
  const captchaToken = payloadKey
    ? payload[payloadKey]?.captchaToken
    : payload.msg.captchaToken;

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
   * Checks if the Supabase client is missing or empty in the configuration.
   * If the Supabase client is missing or empty, it sets an error message in the payload.
   * @param {object} config - The configuration object containing the Supabase client.
   * @param {object} payload - The payload object to store error messages.
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
   * Sign in a user with email, phone, and password using Supabase authentication.
   * @param {string} userEmail - The user's email address.
   * @param {string} userPhone - The user's phone number.
   * @param {string} userPassword - The user's password.
   * @param {string} captchaToken - Optional captcha token for verification.
   * @returns An object containing data and error from the sign-in attempt.
   */
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    phone: userPhone,
    password: userPassword,
    ...(captchaToken ? { options: { captchaToken } } : {}),
  });

  /**
   * Handles an error by setting the status to 400, constructing an error message object,
   * and returning early from the function.
   * @param {Error} error - The error object to handle
   * @returns None
   */
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

  /**
   * Sets the status to 200 and constructs a payload object with authentication information.
   * @param {Object} ctx - The context object to set the status on.
   * @param {Object} data - The data object containing user authentication information.
   * @returns None
   */
  ctx.status = 200;
  payload.msg = {
    success: true,
    message: "Authentication successful",
    Authenticated: true,
    user: data?.user,
    session: data?.session,
    userMetadata: data?.user?.user_metadata,
    weakPassword: data?.weakPassword,
    accessToken: data?.session.access_token,
    refreshToken: data?.session.refresh_token,
  };

  next();
}
