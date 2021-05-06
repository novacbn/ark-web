import {AUTH_TTL, COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN} from "./environment";
import {format_cookie, parse_cookie_header} from "./endpoint";

// #access_token=XXXX
// &expires_in=3600
// &refresh_token=YYYY
// &token_type=bearer
// &type=magiclink

interface IAuthCookieOptions {
    access_token: string;

    expires_in: number;

    persist: boolean;

    refresh_token: string;
}

export interface IAuthCookies {
    access_token?: string;

    refresh_token?: string;
}

export function format_auth_cookies(options: IAuthCookieOptions): string[] {
    const {access_token, expires_in, persist, refresh_token} = options;

    if (!persist) return [format_cookie(COOKIE_ACCESS_TOKEN, access_token)];

    return [
        format_cookie(COOKIE_ACCESS_TOKEN, access_token, expires_in * 1000),
        format_cookie(COOKIE_REFRESH_TOKEN, refresh_token, AUTH_TTL, {
            //            path: `${META_URL}/api/v1/auth/refresh`,
        }),
    ];
}

export function format_unauth_cookies(): string[] {
    return [format_cookie(COOKIE_ACCESS_TOKEN, ""), format_cookie(COOKIE_REFRESH_TOKEN, "")];
}

export function parse_auth_cookies(cookie_header: string): IAuthCookies {
    const cookies = parse_cookie_header(cookie_header);

    return {
        access_token: cookies[COOKIE_ACCESS_TOKEN],
        refresh_token: cookies[COOKIE_REFRESH_TOKEN],
    };
}
