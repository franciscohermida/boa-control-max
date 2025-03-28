import {
  eventHandler,
  getValidatedRouterParams,
  createError,
  readBody,
} from "h3";
import { z } from "zod";
import { pendingRequests } from "../utils/pendingRequests";

export const setRequestOutput = eventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (params) => {
    return z.object({ requestId: z.string() }).parse(params);
  });
  const requestId = params.requestId;

  if (!requestId) {
    throw createError({
      statusCode: 400,
      message: "No requestId provided",
    });
  }

  const body = await readBody(event);
  const pendingRequest = pendingRequests.get(requestId);

  if (!pendingRequest) {
    throw createError({
      statusCode: 404,
      message: "No pending request found",
    });
  }

  pendingRequest.output = body.data;
  pendingRequest.completed = true;

  // Handle MaxScript execution errors
  if (body.error) {
    if (pendingRequest.eventStream) {
      console.log("setRequestOutput Body Error:", body.error);
      await pendingRequest.eventStream.push(JSON.stringify(body));
      await pendingRequest.eventStream.close();
      pendingRequest.eventStream = undefined;
    }
    pendingRequests.delete(requestId);
    throw createError({
      statusCode: 422,
      message: body.error,
    });
  }

  // Handle successful execution
  if (pendingRequest.eventStream) {
    console.log("setRequestOutput Body Result:", body);
    await pendingRequest.eventStream.push(JSON.stringify(body));
    await pendingRequest.eventStream.close();
    pendingRequest.eventStream = undefined;
  }

  pendingRequests.delete(requestId);
  return body;
});
