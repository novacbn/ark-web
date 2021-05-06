import {readdirSync} from "fs";
import {join} from "path";
import {cwd, env} from "process";

import sveltePreprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node";

import {load_dotenv} from "./dotenv.js";

const PROCESS_CWD = cwd();

/** @type {import('@sveltejs/kit').Config} */
export default {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: sveltePreprocess(),

    kit: {
        // By default, `npm run build` will create a standard Node app.
        // You can create optimized builds for different platforms by
        // specifying a different adapter
        adapter: adapter(),

        // hydrate the <div id="svelte"> element in src/app.html
        target: "body",

        // Consult https://vitejs.dev/config/ to learn about these options
        vite: () => {
            // HACK: Since removing the `vite.config.js` loading, SvelteKit doesn't
            // pass the environment into the config function

            // HACK: Parsing the dotenv / environment variables twice...
            const ENV = load_dotenv(env.NODE_ENV);

            const STYLE_SHEET =
                ENV.ARK_STYLE_SHEET ?? "node_modules/@kahi-ui/framework/dist/kahi-ui.framework.css";

            const STYLE_THEME =
                ENV.ARK_STYLE_THEME ??
                "node_modules/@kahi-ui/framework/dist/themes/kahi-ui.theme.default.css";

            const path_sheet = join(PROCESS_CWD, STYLE_SHEET);
            const path_theme = join(PROCESS_CWD, STYLE_THEME);

            /*const server_files = readdirSync("./src/_server").map(
                (file_name) => `./src/_server/${file_name}`
            );*/

            /** @type {import('vite').UserConfig} */
            return {
                resolve: {
                    alias: {
                        "assets/styles/application.css": path_sheet,
                        "assets/styles/application.theme.css": path_theme,
                    },
                },

                /*optimizeDeps: {
                    exclude: server_files,
                },

                ssr: {
                    external: server_files,
                },*/
            };
        },
    },
};
