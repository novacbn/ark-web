import type {SupabaseClient} from "@supabase/supabase-js";
import {format_auth_cookies} from "../../../../_server/auth";
import {guard_formdata, reroute_auth} from "../../../../_server/endpoint";
import {initialize_user} from "../../../../_server/supabase";

export const post = reroute_auth(
    guard_formdata(async (request) => {
        const {logger} = request.locals;
        const {access_token, expires_in, refresh_token, persist = "off"} = Object.fromEntries(
            request.body.entries() as IterableIterator<[string, string | undefined]>
        );

        const parsed_expires = expires_in ? parseInt(expires_in) : 0;
        if (!access_token || !refresh_token || !expires_in || isNaN(parsed_expires)) {
            logger.error(new Error("form data not valid"), "form data not valid");

            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        let client: SupabaseClient;
        try {
            client = await initialize_user(access_token);
        } catch (err) {
            logger.error(err, "failed to initialize user");

            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        const cookies = format_auth_cookies({
            access_token,
            expires_in: parsed_expires,
            refresh_token,
            persist: persist === "on",
        });

        logger.info({persist}, "responding with authentication cookies");

        return {
            status: 303,
            headers: {
                location: "/",

                // HACK: SvelteKit's typings don't accept `Record<string, string | string[]>` at the momenet
                "set-cookie": cookies as any,
            },

            body: "Redirecting to Home, if not redirected <a href='/'>click here</a>.",
        };
    })
);
