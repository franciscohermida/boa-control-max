import {
  eventHandler,
  getValidatedRouterParams,
  createError,
  createEventStream,
} from "h3";
import { z } from "zod";
import { pendingRequests } from "../utils/pendingRequests";

export const getRequestEventStream = eventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (params) => {
    return z.object({ requestId: z.string() }).parse(params);
  });
  const requestId = params.requestId;

  console.log("SSE connection attempt for requestId:", requestId);

  if (!requestId) {
    console.log("No requestId provided");
    throw createError({
      statusCode: 400,
      message: "No requestId provided",
    });
  }

  const pendingRequest = pendingRequests.get(requestId);
  console.log("Pending requests:", pendingRequests);
  console.log("Found pending request:", !!pendingRequest);

  if (!pendingRequest) {
    console.log("No pending request found for requestId:", requestId);
    console.log(
      "Current pending requests:",
      Array.from(pendingRequests.keys())
    );
    throw createError({
      statusCode: 404,
      message: "No pending request found",
    });
  }

  const eventStream = createEventStream(event);
  console.log("Created event stream for requestId:", requestId);
  pendingRequest.eventStream = eventStream;

  eventStream.onClosed(async () => {
    console.log("Event stream closed for requestId:", requestId);
    if (pendingRequest.eventStream === eventStream) {
      pendingRequest.eventStream = undefined;
    }
    await eventStream.close();
  });

  return eventStream.send();
});
