import {createClient} from "@supabase/supabase-js";
import type {SupabaseClient, SupabaseClientOptions} from "@supabase/supabase-js";

import {PUBLIC_SCHEMA, SUPABASE_ANON_KEY, SUPABASE_URL} from "../environment";
import type {ISession} from "../../hooks";

export const ANON_CLIENT: SupabaseClient = create_client();

export function create_client(
    access_token?: string,
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

    return client;
}

export function create_session_client(session: ISession): SupabaseClient | null {
    const {authentication, user} = session;
    if (!authentication || !user) return null;

    const client = create_client(authentication.access_token);

    // @ts-ignore - HACK: No public method of setting directly
    client.auth.currentUser = user;
    return client;
}
