import ms from "ms";

import {parse_filesize} from "./filesize";
import {is_affirmative} from "./string";

export function get_affirmative(value: string | undefined, default_value: string): boolean {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_affirmative' (value is required)");
        }

        value = default_value;
    }

    return is_affirmative(value);
}

export function get_filesize(value: string | undefined, default_value?: string): number {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_filesize' (value is required)");
        }

        value = default_value;
    }

    return parse_filesize(value);
}

export function get_float(value: string | undefined, default_value?: string): number {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_float' (value is required)");
        }

        value = default_value;
    }

    const number = parseFloat(value);
    if (isNaN(number)) {
        throw new Error(`bad argument #0 to 'get_float' (value '${value}', is not a number)`);
    }

    return number;
}

export function get_integer(value: string | undefined, default_value?: string): number {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_integer' (value is required)");
        }

        value = default_value;
    }

    const number = parseInt(value);
    if (isNaN(number)) {
        throw new Error(`bad argument #0 to 'get_integer' (value '${value}', is not a number)`);
    }

    return number;
}

export function get_milliseconds(value: string | undefined, default_value?: string): number {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_time' (value is required)");
        }

        value = default_value;
    }

    return ms(value);
}

export function get_string(value: string | undefined, default_value?: string): string {
    if (!value) {
        if (default_value === undefined) {
            throw new Error("bad argument #0 to 'get_string' (value is required)");
        }

        return default_value;
    }

    return value;
}
