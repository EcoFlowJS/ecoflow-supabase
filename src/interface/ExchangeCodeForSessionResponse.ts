import { AuthError, Session, User } from "@supabase/supabase-js";

/**
 * Interface representing the response when exchanging code for a session.
 * @interface ExchangeCodeForSessionResponse
 * @property {object} data - The data object containing either user and session or null values.
 * @property {object} data.user - The user object if available.
 * @property {object} data.session - The session object if available.
 * @property {object} error - The error object if there was an authentication error.
 */
export interface ExchangeCodeForSessionResponse {
  /**
   * Represents a data object that can have either a user and session object or null values.
   * @typedef {Object} Data
   * @property {User | null} user - The user object or null.
   * @property {Session | null} session - The session object or null.
   */
  data:
    | {
        /**
         * Represents a user object.
         * @property {User} user - The user object.
         */
        user: User;

        /**
         * Represents a session object.
         * @type {Session}
         */
        session: Session;
      }
    | {
        /**
         * This function takes in a user object and sets it to null.
         * @param {object} user - The user object to set to null.
         * @returns None
         */
        user: null;

        /**
         * Represents a null value for a session.
         * @type {null}
         */
        session: null;
      };

  /**
   * Represents an error that can occur during authentication.
   * @type {AuthError | null}
   */
  error: AuthError | null;
}

/**
 * Interface representing the data returned when exchanging a code for session data.
 */
export interface ExchangeCodeForSessionData {
  /**
   * Represents a user object.
   * @property {User} user - The user object.
   */
  user: User;

  /**
   * Represents a session object.
   * @type {Session}
   */
  session: Session;
}

/**
 * Interface representing the exchange of code for session data when user and session are null.
 */
export interface ExchangeCodeForSessionDataNull {
  /**
   * This function takes in a user object and sets it to null.
   * @param {object} user - The user object to set to null.
   * @returns None
   */
  user: null;

  /**
   * Set the session to null.
   * @returns None
   */
  session: null;
}
