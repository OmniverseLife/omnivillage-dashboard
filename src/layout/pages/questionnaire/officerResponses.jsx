import Responses from "./responses";

/** The page at /officer/responses: what field officers saved, read by place. */
export default function OfficerResponses() {
    return <Responses audience="officer" />;
}
