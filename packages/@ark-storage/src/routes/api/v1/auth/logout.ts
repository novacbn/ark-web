import {format_unauth_cookies} from "../../../../_server/auth";
import {reroute_unauth} from "../../../../_server/endpoint";

export const post = reroute_unauth(async (request) => {
    const {logger, session, supabase} = request.locals;

    const cookies = format_unauth_cookies();
    const {error} = await supabase.auth.api.signOut(session.access_token);
    if (error) {
        logger.error(error, "failed to sign out");

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    logger.info({}, "signed out client");

    return {
        status: 303,
        headers: {
            location: "/auth/login?state=logout",
            "set-cookie": cookies as any,
        },

        body:
            "Redirecting to Login, if not redirected <a href='/auth/login?state=logout'>click here</a>.",
    };
});
