import { Context } from "koa";

/**
 * Handles the callback from the authentication flow by exchanging the provided code for a session.
 * @param {Context} ctx - The Koa context object.
 * @returns None
 */
export default async function callbackController(ctx: Context) {
  /**
   * Destructures the "_" property from the ecoFlow object.
   * @param {object} ecoFlow - The ecoFlow object
   * @returns None
   */
  const { _ } = ecoFlow;

  /**
   * Destructures the 'code' and 'next' properties from the 'ctx.query' object.
   * @param {Object} ctx - The context object containing the query parameters.
   * @returns An object with 'code' and 'next' properties.
   */
  const { code, next } = ctx.query;

  /**
   * Checks if a code string is provided, if not, returns an error message.
   * @param {string} code - The code string to check.
   * @returns None
   */
  if (!code) {
    ctx.body = {
      error: true,
      message: "No code provided",
    };
    return;
  }

  /**
   * Checks if the Supabase client is undefined or empty. If it is, sets the response body
   * to an error message indicating that the Supabase client is missing.
   * @param {any} supabase - The Supabase client object to check.
   * @returns None
   */
  if (_.isUndefined(supabase) || _.isEmpty(supabase)) {
    ctx.body = {
      msg: {
        error: true,
        message: "Missing supabase client",
      },
    };
    return;
  }

  /**
   * Exchanges a code for a session using Supabase authentication.
   * @param {string} code - The code to exchange for a session.
   * @returns An object containing the data and any potential error from the exchange.
   */
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code as string
  );

  /**
   * If an error is present, set the response body to an object containing the error message,
   * raw error, and a flag indicating an error occurred. Then, return from the function.
   * @param {Error} error - The error object to be handled.
   * @returns None
   */
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

  /**
   * Sets the response body with a success message and user data after successful authentication.
   * @param {Object} data - The data object containing user information and session data.
   * @param {string} [next] - Optional redirect URL after authentication.
   * @returns None
   */
  ctx.body = {
    msg: {
      success: true,
      message: "Authentication successful",
      user: data.user,
      session: data.session,
      userMetadata: data.user.user_metadata,
      ...(next ? { redirect_url: next } : {}),
    },
  };
}
