import type {CookieSerializeOptions} from "cookie";
import {parse, serialize} from "cookie";
import type {Request, RequestHandler} from "@sveltejs/kit";
import type {ReadOnlyFormData} from "@sveltejs/kit/types/helper";

import type {ILocals} from "../hooks";

import {META_BASE, META_URL} from "../shared/environment";

const DEFAULT_COOKIE_OPTIONS: CookieSerializeOptions = {
    httpOnly: true,
    path: META_BASE,
    sameSite: "strict",
    secure: META_URL.startsWith("https://"),
};

export function format_cookie(
    name: string,
    data: string,
    expiration?: number,
    options: CookieSerializeOptions = {}
): string {
    const expires = expiration ? new Date(Date.now() + expiration) : undefined;

    return serialize(name, data, {
        ...DEFAULT_COOKIE_OPTIONS,
        expires,
        ...options,
    });
}

export function parse_cookie_header(cookies: string = ""): Record<string, string | undefined> {
    return parse(cookies);
}

export function guard_formdata<Locals = ILocals>(
    callback?: RequestHandler<Locals, ReadOnlyFormData>
): RequestHandler<Locals, ReadOnlyFormData> {
    return (request) => {
        const {body, headers} = request;
        const content_type = (headers["content-type"] ?? "").toLowerCase();

        if (
            (content_type !== "application/x-www-form-urlencoded" &&
                content_type !== "multipart/form-data") ||
            body.constructor.name != "ReadOnlyFormData"
        ) {
            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        return callback ? callback(request) : {};
    };
}

export function reroute_auth<Body = unknown>(
    callback?: RequestHandler<ILocals, Body>
): RequestHandler<ILocals, Body> {
    return (request) => {
        const {supabase, storage} = request.locals;

        if (supabase && storage) {
            return {
                status: 307,
                headers: {
                    location: "/storage",
                },

                body:
                    "Previously authenticated, redirecting to Files. If not redirected <a href='/storage'>click here</a>.",
            };
        }

        return callback ? callback(request) : {};
    };
}

export function reroute_unauth<Body = unknown>(
    callback?: RequestHandler<Required<ILocals>, Body>
): RequestHandler<ILocals, Body> {
    return (request) => {
        const {supabase, storage} = request.locals;

        if (!supabase || !storage) {
            return {
                status: 307,
                headers: {
                    location: "/auth/login",
                },

                body:
                    "Authentication required, redirecting to Log In. If not redirected <a href='/auth/login'>click here</a>.",
            };
        }

        return callback ? callback(request as Request<Required<ILocals>, Body>) : {};
    };
}
