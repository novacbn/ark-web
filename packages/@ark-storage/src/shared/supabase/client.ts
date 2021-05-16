import type {SupabaseClient, SupabaseClientOptions, User} from "@supabase/supabase-js";
import {createClient} from "@supabase/supabase-js";

import {PUBLIC_SCHEMA, SUPABASE_ANON_KEY, SUPABASE_URL} from "../environment";

export const ANON_CLIENT: SupabaseClient = create_client();

export function create_client(
    access_token?: string,
    user?: User,
    options: SupabaseClientOptions = {}
): SupabaseClient {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        schema: PUBLIC_SCHEMA,
        ...options,

        // NOTE: We handle these via the server and cookies, so don't
        // want the client to step on our toes
        autoRefreshToken: false,
        detectSessionInUrl: false,
        localStorage: undefined,
        persistSession: false,
    });

    if (access_token) {
        // @ts-ignore - HACK: No public method of setting directly
        client.auth.currentSession = {access_token};
    }

    if (user) {
        // @ts-expect-error - HACK: No public method of setting directly
        client.auth.currentUser = user;
    }

    return client;
}
