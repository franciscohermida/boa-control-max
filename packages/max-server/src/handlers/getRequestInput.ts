import { eventHandler, getValidatedRouterParams, createError } from "h3";
import { z } from "zod";
import { pendingRequests } from "../utils/pendingRequests";

export const getRequestInput = eventHandler(async (event) => {
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

  const pendingRequest = pendingRequests.get(requestId);
  if (!pendingRequest) {
    throw createError({
      statusCode: 404,
      message: "No pending request found",
    });
  }

  return { data: { input: pendingRequest.input } };
});
