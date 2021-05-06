import {guard_formdata, reroute_unauth} from "../../../../../../_server/endpoint";

// TODO: uploading

export const post = guard_formdata(async (request) => {
    const {headers} = request;
    const {logger, user} = request.context;
    const {directory_path = ""} = request.params;
    const file = request.body.get("file");

    console.log({directory_path, file});

    return {
        status: 200,
        body: "",
    };
});
