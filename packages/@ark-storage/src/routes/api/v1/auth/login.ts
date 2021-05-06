import {guard_formdata, reroute_auth} from "../../../../_server/endpoint";

import {META_URL} from "../../../../shared/environment";

import {ANON_CLIENT} from "../../../../shared/supabase/client";

export const post = reroute_auth(
    guard_formdata(async (request) => {
        const {logger} = request.locals;
        const email = request.body.get("email");

        const {error} = await ANON_CLIENT.auth.signIn(
            {email},
            {redirectTo: `${META_URL}/auth/callback`}
        );

        if (error) {
            logger.error(error, `failed to sign in with '${email}'`);

            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        logger.info({email}, `E-Mail sent to '${email}'`);

        return {
            status: 303,
            headers: {
                location: "/auth/login?state=sent",
            },

            body:
                "Redirecting back to Login, if not redirected <a href='/auth/login?state=sent'>click here</a>.",
        };
    })
);
