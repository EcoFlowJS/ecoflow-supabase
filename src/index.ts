import { ModuleManifest, ModuleSpecsInputsTypeOptions } from "@ecoflow/types";
import { SupabaseClient } from "@supabase/supabase-js";

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
  const { server, moduleConfigs } = ecoFlow;
  const configManager = moduleConfigs.selectPackage("ecoflow-supabase");

  const selectClientConfig = (): ModuleSpecsInputsTypeOptions[] => {
    if (!configManager) return [];

    const result: ModuleSpecsInputsTypeOptions[] = [];

    for (const [key, { label }] of configManager.allConfigs.entries()) {
      result.push({ label: `${label} (${key})`, value: key });
    }

    return result;
  };

  return {
    name: "Supabase",
    specs: [
      {
        name: "Supabase Configuration",
        type: "Configuration",
        color: "#00453d",
        inputs: [
          {
            name: "projectURL",
            type: "String",
            label: "Project URL",
            required: true,
          },
          {
            name: "apiKey",
            type: "String",
            label: "API Key",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix. example:"ECOFLOW_USER_". Default:ECOFLOW_USER_SUPABASE_API_KEY',
          },
          {
            name: "apiKeyFromEnv",
            type: "Checkbox",
            label: "Api key from environment variable.",
            required: false,
            hint: 'For environment variables provide EcoFlow prefix in Api Key. example:"ECOFLOW_USER_"',
          },
        ],
        description: "Supabase configuration",
        controller: "ConfigurationController",
      },

      {
        name: "Signup",
        type: "Middleware",
        description: "Supabase Signup",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
          {
            name: "email",
            type: "String",
            label: "Email",
            required: false,
          },
          {
            name: "Phone",
            type: "String",
            label: "Phone",
            required: false,
          },
          {
            name: "password",
            type: "HiddenString",
            label: "Password",
            required: false,
          },

          {
            name: "uData",
            type: "Code",
            label: "User data",
            codeLanguage: "json",
            required: false,
            defaultValue: "{}",
          },

          {
            name: "fromPayload",
            type: "Checkbox",
            label: "From payload",
            hint: "Fetch Email/Phone and password from payload body.",
            required: false,
          },
          {
            name: "payloadKey",
            type: "String",
            label: "Payload key",
            hint: "Default is 'msg'",
            defaultValue: "msg",
            required: false,
          },
        ],
        controller: "SignUp",
      },

      {
        name: "Oauth SignIn",
        type: "Middleware",
        description: "Supabase OAuth module",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
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
          {
            name: "callbackURL",
            type: "String",
            label: "Callback URL",
            required: false,
            hint: `Leave blank if you want to use the default callback URL. Default: ${server.baseUrl} /api /auth /supabase /callback /[provider]`,
          },
        ],
        controller: "OauthController",
      },

      {
        name: "SignIn with Password",
        type: "Middleware",
        description: "Supabase SignIn with password",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
          {
            name: "email",
            type: "String",
            label: "Email",
            required: false,
          },
          {
            name: "Phone",
            type: "String",
            label: "Phone",
            required: false,
          },
          {
            name: "password",
            type: "HiddenString",
            label: "Password",
            required: false,
          },

          {
            name: "fromPayload",
            type: "Checkbox",
            label: "From payload",
            hint: "Fetch Email/Phone and password from payload body.",
            required: false,
          },
          {
            name: "payloadKey",
            type: "String",
            label: "Payload key",
            hint: "Default is 'msg'",
            defaultValue: "msg",
            required: false,
          },
        ],
        controller: "SignInWithPassword",
      },

      {
        name: "SignIn with OTP",
        type: "Middleware",
        description: "Supabase SignIn with OTP\n Note:Still under development.",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
          {
            name: "email",
            type: "String",
            label: "Email",
            required: false,
          },
          {
            name: "Phone",
            type: "String",
            label: "Phone",
            required: false,
          },

          {
            name: "fromPayload",
            type: "Checkbox",
            label: "From payload",
            hint: "Fetch Email/Phone and password from payload body.",
            required: false,
          },
          {
            name: "payloadKey",
            type: "String",
            label: "Payload key",
            hint: "Default is 'msg'",
            defaultValue: "msg",
            required: false,
          },
          {
            name: "callbackURL",
            type: "String",
            label: "Callback URL",
            required: false,
            hint: `Leave blank if you want to use the default callback URL. Default: ${server.baseUrl} /api /auth /supabase /callback /OTP`,
          },
        ],
        controller: "SignInWithOTP",
      },

      {
        name: "Oauth isAuthenticated",
        type: "Middleware",
        description: "Checks if the user is authenticated using Supabase OAuth",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
        ],
        controller: "OauthIsAuthenticated",
      },

      {
        name: "Refresh Session",
        type: "Middleware",
        description: "Refreshes the session with Supabase",
        inputs: [
          {
            name: "client",
            label: "Client",
            type: "SelectPicker",
            required: true,
            pickerOptions: selectClientConfig,
          },
          {
            name: "refreshToken",
            label: "Refresh token",
            type: "String",
            required: true,
            hint: "If passed by payload is checked, kindly provide a refresh token payload key.",
          },
          {
            name: "passByPayload",
            label: "Pass by payload",
            type: "Checkbox",
            required: false,
            hint: "If checked, kindly provide a refresh token payload key.",
          },
        ],
        controller: "refreshSession",
      },
    ],
  };
}
