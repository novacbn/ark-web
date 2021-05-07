const DEFAULT_ORIGIN: string = "http://fake.invalid";

export function append_pathname(uri: string, path: string): string {
    path = normalize_pathname(path);
    if (!uri) return path;

    let {hash, pathname, origin, search} = new URL(uri, DEFAULT_ORIGIN);

    pathname = pathname.endsWith("/") ? pathname.slice(0, -1) + path : pathname + path;
    origin = origin === DEFAULT_ORIGIN ? "" : origin;

    return origin + pathname + search + hash;
}

export function base_pathname(uri: string): string {
    const pathname = normalize_pathname(uri).slice(1);
    const segments = pathname.split("/");

    return "/" + segments[segments.length - 1];
}

export function dir_pathname(uri: string): string {
    const pathname = normalize_pathname(uri).slice(1);
    const segments = pathname.split("/");

    return "/" + segments.slice(0, -1).join("/");
}

export function ext_pathname(uri: string): string {
    const pathname = normalize_pathname(uri);
    const segments = pathname.split(".");

    if (segments.length < 2) return "";
    return "." + segments[segments.length - 1];
}

export function normalize_pathname(uri: string): string {
    const {pathname} = new URL(uri, DEFAULT_ORIGIN);

    return pathname;
}

export function normalize_origin(uri: string): string {
    const {origin} = new URL(uri);

    return origin;
}

export function normalize_relative(uri: string): string {
    const {hash, pathname, search} = new URL(uri, DEFAULT_ORIGIN);

    return pathname + search + hash;
}
