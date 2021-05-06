import type {RequestHandler} from "@sveltejs/kit";

import type {IContext} from "../hooks";
import {reroute_auth, reroute_unauth} from "../_server/endpoint";

export const get: RequestHandler<IContext> = reroute_auth(reroute_unauth());
