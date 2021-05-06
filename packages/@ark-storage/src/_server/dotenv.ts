import {load_dotenv} from "../../dotenv.js";

// HACK: This is just a slight edit of Vite's dotenv
// loading code, to support serverside only non-public variables

export const ENV: Record<string, string | undefined> = load_dotenv(import.meta.env.mode);
