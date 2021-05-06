import {ENV} from "./dotenv";

import {get_milliseconds, get_string} from "../shared/util/environment";

// HACK: SvelteKit doesn't do inline replacements and instead
// just loads up all `VITE_` variables in the client payload. So we
// instead prefix all non-public variables with `ARK_`

export const AUTH_TTL = get_milliseconds(ENV.ARK_AUTH_TTL, "30 days");

export const COOKIE_ACCESS_TOKEN = get_string(ENV.ARK_COOKIE_ACCESS_TOKEN, "access_token");

export const COOKIE_REFRESH_TOKEN = get_string(ENV.ARK_COOKIE_REFRESH_TOKEN, "refresh_token");

export const SUPABASE_SERVICE_KEY = get_string(ENV.ARK_SUPABASE_SERVICE_KEY);
