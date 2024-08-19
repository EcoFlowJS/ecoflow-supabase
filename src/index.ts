import { ModuleManifest } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Declares a global variable 'supabase' of type SupabaseClient with optional null value.
 * Extends the NodeJS global namespace to include the 'supabase' variable.
 */
declare global {
  /**
   * Variable declaration for Supabase client.
   * @type {SupabaseClient<any, "public", any> | null}
   */
  var supabase: SupabaseClient<any, "public", any> | null;

  /**
   * Extends the NodeJS Global interface to include a property 'supabase' of type SupabaseClient.
   * @namespace NodeJS
   * @interface Global
   * @property {SupabaseClient<any, "public", any> | null} supabase - The Supabase client instance or null.
   */
  namespace NodeJS {
    /**
     * Represents the global interface that contains the Supabase client instance.
     * @interface Global
     * @property {SupabaseClient<any, "public", any> | null} supabase - The Supabase client instance or null if not initialized.
     */
    interface Global {
      /**
       * A variable representing a Supabase client instance.
       * @type {SupabaseClient<any, "public", any> | null}
       */
      supabase: SupabaseClient<any, "public", any> | null;
    }
  }
}

/**
 * Generates a module manifest for the Supabase OAuth module.
 * @returns {ModuleManifest} An object containing the module name, specifications, and controller.
 */
export default function functionManifest(): ModuleManifest {
  /**
   * Destructures properties from the ecoFlow object.
   * @param {Object} ecoFlow - The ecoFlow object containing the 'server' property.
   * @returns The 'server' property from the ecoFlow object.
   */
  const { server } = ecoFlow;

  /**
   * Global variable to store the Supabase client instance.
   * Initialized as null.
   */
  global.supabase = null;

  return {
    name: "Supabase",
    specs: [
      /**
       * Represents an OAuth middleware module for Supabase.
       * @type {Object}
       * @property {string} name - The name of the module ("Oauth").
       * @property {string} type - The type of module ("Middleware").
       * @property {string} describtion - A description of the module ("Supabase OAuth module").
       * @property {Array<Object>} inputs - An array of input objects for the module.
       * @property {string} inputs[].name - The name of the input.
       * @property {string} inputs[].type - The data type of the input.
       * @property {string} inputs[].label - The label for the input.
       * @property {boolean} inputs[].required - Indicates whether the input is required.
       * @property {string} inputs[].hint - Indicates hint for the input.
       * @property {string[]} inputs[].pickerOptions - An array of options for the input SelectPicker.
       * @property {string} controller - The name of the controller for the module.
       */
      {
        /**
         * Represents the name of the authentication method as "Oauth".
         */
        name: "Oauth SignIn",

        /**
         * Represents the type of a component as "Middleware".
         */
        type: "Middleware",

        /**
         * Description: "Supabase OAuth module"
         */
        describtion: "Supabase OAuth module",

        /**
         * An array of input objects representing different configuration options for a project.
         * @type {Array<Object>}
         * @property {string} name - The name of the input field.
         * @property {string} type - The type of input field (String, Checkbox, SelectPicker).
         * @property {string} label - The label for the input field.
         * @property {boolean} required - Indicates if the input is required.
         * @property {string} hint - Additional information or instructions for the input field.
         * @property {Array<string>} pickerOptions - An array of options for SelectPicker type inputs.
         */
        inputs: [
          /**
           * Represents a field in a form with the name, type, label, and required status.
           * @type {Object}
           * @property {string} name - The name of the field.
           * @property {string} type - The type of the field.
           * @property {string} label - The label of the field.
           * @property {boolean} required - Indicates if the field is required.
           */
          {
            name: "projectURL",
            type: "String",
            label: "Project URL",
            required: true,
          },

          /**
           * Represents a configuration object for an API key field.
           * @type {Object}
           * @property {string} name - The name of the API key field.
           * @property {string} type - The data type of the API key field.
           * @property {string} label - The label to display for the API key field.
           * @property {boolean} required - Indicates if the API key field is required.
           * @property {string} hint - Additional information or hint for the API key field.
           */
          {
            name: "apiKey",
            type: "String",
            label: "API Key",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix. example:"ECOFLOW_USER_". Default:ECOFLOW_USER_SUPABASE_API_KEY',
          },

          /**
           * Represents a configuration option for an API key sourced from an environment variable.
           * @type {Object}
           * @property {string} name - The name of the configuration option ("apiKeyFromEnv").
           * @property {string} type - The type of input element ("Checkbox").
           * @property {string} label - The label displayed for the configuration option ("Api key from environment variable.").
           * @property {boolean} required - Indicates if the API key is required (false).
           * @property {string} hint - Additional information or instructions for the configuration option.
           */
          {
            name: "apiKeyFromEnv",
            type: "Checkbox",
            label: "Api key from environment variable.",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix in Api Key. example:"ECOFLOW_USER_"',
          },

          /**
           * Represents a provider select picker field with a list of available provider options.
           * @type {Object}
           * @property {string} name - The name of the field.
           * @property {string} type - The type of field (SelectPicker).
           * @property {string} label - The label displayed for the field.
           * @property {boolean} required - Indicates if the field is required.
           * @property {string[]} pickerOptions - An array of provider options to choose from.
           */
          {
            name: "provider",
            type: "SelectPicker",
            label: "Provider",
            required: true,
            pickerOptions: [
              "apple",
              "azure",
              "bitbucket",
              "discord",
              "facebook",
              "figma",
              "github",
              "gitlab",
              "google",
              "kakao",
              "keycloak",
              "linkedin",
              "linkedin_oidc",
              "notion",
              "slack",
              "slack_oidc",
              "spotify",
              "twitch",
              "twitter",
              "workos",
              "zoom",
              "fly",
            ],
          },

          /**
           * Represents a configuration object for a callback URL field.
           * @type {Object}
           * @property {string} name - The name of the field.
           * @property {string} type - The type of the field.
           * @property {string} label - The label of the field.
           * @property {boolean} required - Indicates if the field is required.
           * @property {string} hint - Additional information or instructions for the field.
           */
          {
            name: "callbackURL",
            type: "String",
            label: "Callback URL",
            required: false,
            hint: `Leave blank if you want to use the default callback URL. Default: ${server.baseUrl} /api /auth /supabase /callback /[provider]`,
          },
        ],

        /**
         * The controller responsible for handling OAuth operations.
         */
        controller: "OauthController",
      },

      /**
       * Represents a middleware named "Oauth isAuthenticated" that checks if the user is authenticated using Supabase OAuth.
       * @type {Object}
       * @property {string} name - The name of the middleware.
       * @property {string} type - The type of the middleware.
       * @property {string} describtion - The description of the middleware.
       * @property {Array<Object>} inputs - An array of input objects for the middleware.
       * @property {string} inputs.name - The name of the input.
       * @property {string} inputs.type - The type of the input.
       * @property {string} inputs.label - The label of the input.
       * @property {boolean} inputs.required - Indicates if the input
       */
      {
        /**
         * Represents the name of the authentication method as "Oauth isAuthenticated".
         */
        name: "Oauth isAuthenticated",

        /**
         * Represents the type of a component as "Middleware".
         */
        type: "Middleware",

        /**
         * Checks if the user is authenticated using Supabase OAuth.
         * @returns None
         */
        describtion: "Checks if the user is authenticated using Supabase OAuth",

        /**
         * Defines the input fields for a project configuration form.
         * @returns An array of objects, each representing an input field with properties like name, type, label, required, hint, and pickerOptions.
         */
        inputs: [
          /**
           * Represents a field in a form with the following properties:
           * @param {string} name - The name of the field.
           * @param {string} type - The data type of the field.
           * @param {string} label - The label or display name of the field.
           * @param {boolean} required - Indicates if the field is required or not.
           */
          {
            name: "projectURL",
            type: "String",
            label: "Project URL",
            required: true,
          },

          /**
           * Represents a configuration object for an API key field.
           * @type {Object}
           * @property {string} name - The name of the API key field.
           * @property {string} type - The data type of the API key field.
           * @property {string} label - The label for the API key field.
           * @property {boolean} required - Indicates if the API key field is required.
           * @property {string} hint - Additional information or instructions for the API key field.
           */
          {
            name: "apiKey",
            type: "String",
            label: "API Key",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix. example:"ECOFLOW_USER_". Default:ECOFLOW_USER_SUPABASE_API_KEY',
          },

          /**
           * Represents a configuration object for a checkbox input field.
           * @type {Object}
           * @property {string} name - The name of the input field.
           * @property {string} type - The type of input field, in this case, "Checkbox".
           * @property {string} label - The label text displayed next to the checkbox.
           * @property {boolean} required - Indicates if the checkbox is required to be checked.
           * @property {string} hint - Additional information or instructions for the checkbox field.
           */
          {
            name: "apiKeyFromEnv",
            type: "Checkbox",
            label: "Api key from environment variable.",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix in Api Key. example:"ECOFLOW_USER_"',
          },
        ],

        /**
         * Represents a controller named "OauthIsAuthenticated".
         */
        controller: "OauthIsAuthenticated",
      },

      /**
       * Represents a middleware function that refreshes the session with Supabase.
       * @type {Object}
       * @property {string} name - The name of the middleware ("Refresh Session").
       * @property {string} type - The type of middleware ("Middleware").
       * @property {string} describtion - A description of what the middleware does ("Refreshes the session with Supabase").
       * @property {Array<Object>} inputs - An array of input objects with properties like name, type, label, required, and hint.
       * @property {string} controller - The controller function associated with this middleware ("refreshSession").
       */
      {
        /**
         * Represents a command to refresh the current session.
         * @type {string}
         */
        name: "Refresh Session",

        /**
         * Represents a type of "Middleware".
         */
        type: "Middleware",

        /**
         * Refreshes the session with Supabase.
         */
        describtion: "Refreshes the session with Supabase",

        /**
         * Defines an array of input objects with specific properties for a configuration setup.
         * @returns {Array} An array of input objects with properties like name, type, label, required, and hint.
         */
        inputs: [
          /**
           * Represents a field in a form with the name, type, label, and required status.
           * @type {Object}
           * @property {string} name - The name of the field.
           * @property {string} type - The type of the field.
           * @property {string} label - The label of the field.
           * @property {boolean} required - Indicates if the field is required.
           */
          {
            name: "projectURL",
            type: "String",
            label: "Project URL",
            required: true,
          },

          /**
           * Represents a configuration object for an API key field.
           * @type {Object}
           * @property {string} name - The name of the API key field.
           * @property {string} type - The data type of the API key field.
           * @property {string} label - The label to display for the API key field.
           * @property {boolean} required - Indicates if the API key field is required.
           * @property {string} hint - Additional information or hint for the API key field.
           */
          {
            name: "apiKey",
            type: "String",
            label: "API Key",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix. example:"ECOFLOW_USER_". Default:ECOFLOW_USER_SUPABASE_API_KEY',
          },

          /**
           * Represents a configuration object for an "apiKeyFromEnv" field in a form.
           * @type {Object}
           * @property {string} name - The name of the field ("apiKeyFromEnv").
           * @property {string} type - The type of the field ("Checkbox").
           * @property {string} label - The label text for the field ("Api key from environment variable.").
           * @property {boolean} required - Indicates if the field is required (false).
           * @property {string} hint - Additional information or hint for the field.
           */
          {
            name: "apiKeyFromEnv",
            type: "Checkbox",
            label: "Api key from environment variable.",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix in Api Key. example:"ECOFLOW_USER_"',
          },

          /**
           * Represents a configuration object for a "refreshToken" field in a form.
           * @type {Object}
           * @property {string} name - The name of the field ("refreshToken").
           * @property {string} label - The label displayed for the field ("Refresh token").
           * @property {string} type - The data type of the field ("String").
           * @property {boolean} required - Indicates if the field is required (true).
           * @property {string} hint - Additional information or instructions for the field.
           */
          {
            name: "refreshToken",
            label: "Refresh token",
            type: "String",
            required: true,
            hint: "If passed by payload is checked, kindly provide a refresh token payload key.",
          },

          /**
           * Represents a configuration object for a "Pass by payload" option in a form.
           * @type {Object}
           * @property {string} name - The name of the option ("passByPayload").
           * @property {string} label - The label displayed for the option ("Pass by payload").
           * @property {string} type - The type of the input field ("Checkbox").
           * @property {boolean} required - Indicates if the option is required (false).
           * @property {string} hint - Additional information or hint for the option.
           */
          {
            name: "passByPayload",
            label: "Pass by payload",
            type: "Checkbox",
            required: false,
            hint: "If checked, kindly provide a refresh token payload key.",
          },
        ],

        /**
         * Represents a controller action to refresh the session.
         * @type {string}
         */
        controller: "refreshSession",
      },
    ],
  };
}
