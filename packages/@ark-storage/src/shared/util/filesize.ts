import xbytes from "xbytes";

import {is_affirmative} from "./string";

const env: Record<string, string> = (import.meta as any).env;

const LOCALE_IEC = is_affirmative(env.VITE_LOCALE_IEC || "true");

export function format_bytes(bytes: number): string {
    return xbytes(bytes, {iec: LOCALE_IEC});
}

export function parse_filesize(text: number | string): number {
    return xbytes.parseSize(text.toString());
}
