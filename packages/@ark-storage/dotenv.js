import {existsSync, readFileSync} from "fs";
import {join} from "path";
import {cwd} from "process";

import dotenv from "dotenv";
import expand from "dotenv-expand";

// HACK: This is just a slight edit of Vite's dotenv
// loading code, to support serverside only non-public variables

/**
 * @param {string} mode
 * @param {string} root
 * @returns {Record<string, string | undefined>}
 */
export function load_dotenv(mode, root = "") {
    if (!root) root = cwd();

    if (mode === "local") {
        throw new Error(
            `"local" cannot be used as a mode name because it conflicts with ` +
                `the .local postfix for .env files.`
        );
    }

    const env = {...process.env};
    const envFiles = [
        /** mode local file */ `.env.${mode}.local`,
        /** mode file */ `.env.${mode}`,
        /** local file */ `.env.local`,
        /** default file */ `.env`,
    ];

    for (const file of envFiles) {
        const path = join(root, file);
        if (existsSync(path)) {
            const parsed = dotenv.parse(readFileSync(path), {
                debug: !!process.env.DEBUG || undefined,
            });

            // let environment variables use each other
            expand({parsed});
            for (const [key, value] of Object.entries(parsed)) env[key] = value;
        }
    }

    return env;
}
