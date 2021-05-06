import type {LoadAuth, LoadInputAuth, LoadUnauth} from "@sveltejs/kit";

export function reroute_auth(callback?: LoadAuth): LoadUnauth {
    return (input) => {
        const {authentication} = input.session;

        if (authentication) {
            return {
                status: 307,
                redirect: "/storage",
            };
        }

        return callback ? callback(input as LoadInputAuth) : {};
    };
}

export function reroute_unauth(callback?: LoadAuth): LoadUnauth {
    return (input) => {
        const {authentication} = input.session;

        if (!authentication) {
            return {
                status: 307,
                redirect: "/auth/login",
            };
        }

        return callback ? callback(input as LoadInputAuth) : {};
    };
}
