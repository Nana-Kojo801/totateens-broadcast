/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appSettings from "../appSettings.js";
import type * as crons from "../crons.js";
import type * as groups from "../groups.js";
import type * as history from "../history.js";
import type * as importOps from "../importOps.js";
import type * as lib_renderMessage from "../lib/renderMessage.js";
import type * as lib_templateConfig from "../lib/templateConfig.js";
import type * as lib_unicodeFonts from "../lib/unicodeFonts.js";
import type * as messageQueries from "../messageQueries.js";
import type * as messages from "../messages.js";
import type * as reformatOps from "../reformatOps.js";
import type * as templateParse from "../templateParse.js";
import type * as templates from "../templates.js";
import type * as uploadAction from "../uploadAction.js";
import type * as uploadOps from "../uploadOps.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appSettings: typeof appSettings;
  crons: typeof crons;
  groups: typeof groups;
  history: typeof history;
  importOps: typeof importOps;
  "lib/renderMessage": typeof lib_renderMessage;
  "lib/templateConfig": typeof lib_templateConfig;
  "lib/unicodeFonts": typeof lib_unicodeFonts;
  messageQueries: typeof messageQueries;
  messages: typeof messages;
  reformatOps: typeof reformatOps;
  templateParse: typeof templateParse;
  templates: typeof templates;
  uploadAction: typeof uploadAction;
  uploadOps: typeof uploadOps;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
