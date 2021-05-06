import {dev} from "$app/env";
import ms from "ms";
import pino from "pino";
import type {Request, Response} from "@sveltejs/kit";
import {ulid} from "ulid";

import type {ILogger} from "../shared/logger";

export type ILoggerRequest = () => void;

export type ILoggerResponse = (response: Response) => void;

export interface IServerLogger extends ILogger {
    request: ILoggerRequest;

    response: ILoggerResponse;
}

const SERVER_LOGGER: pino.Logger = pino({prettyPrint: dev});

export function make_logger(request: Request): IServerLogger {
    // TODO: Doesn't really seem a difference between `Incoming` / `Request`? Seems to
    // be just that `Request` includes context

    let start_time: number;
    const request_identifier = ulid();

    const query = request.query.toString();
    const url = request.path + (query ? `?${query}` : "");

    const request_log = {
        req: {
            id: request_identifier,
            method: request.method,
            url,
            headers: request.headers,
        },
    };

    return {
        info: (obj = {}, msg?, ...args) =>
            SERVER_LOGGER.info({...obj, ...request_log}, msg, ...args),
        warn: (obj = {}, msg?, ...args) =>
            SERVER_LOGGER.warn({...obj, ...request_log}, msg, ...args),

        error: (err, msg?, ...args) => {
            const error_log = {
                ...request_log,

                err: {
                    type: err.name,
                    message: err.message,
                    stack: err.stack,
                },
            };

            SERVER_LOGGER.error(error_log, msg, ...args);
        },

        request: () => {
            start_time = Date.now();

            SERVER_LOGGER.info(request_log, `request started for '${url}'`);
        },

        response: (response) => {
            const response_delta = Date.now() - start_time;

            const response_log = {
                ...request_log,

                res: {
                    statusCode: response.status,
                    headers: response.headers,
                },

                responseTime: response_delta,
            };

            SERVER_LOGGER.info(
                response_log,
                `response finished for '${url}' (${ms(response_delta)})`
            );
        },
    };
}
