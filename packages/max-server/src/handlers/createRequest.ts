import { eventHandler, readBody } from "h3";
import { pendingRequests } from "../utils/pendingRequests";

const TIMEOUT_MS = 30000;

export const createRequest = eventHandler(async (event) => {
  const { data, type } = await readBody(event);
  console.log("Received request with type:", type);

  const requestId = crypto.randomUUID();
  console.log("Generated requestId:", requestId);

  const timeout = setTimeout(() => {
    console.log("Request timed out, removing requestId:", requestId);
    pendingRequests.delete(requestId);
  }, TIMEOUT_MS);

  pendingRequests.set(requestId, {
    timeout,
    input: data,
    output: null,
    completed: false,
  });
  console.log(
    "Added pending request. Current requests:",
    Array.from(pendingRequests.keys())
  );

  return { requestId };
});
