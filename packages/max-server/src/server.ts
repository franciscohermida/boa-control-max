import { createApp, toNodeListener, createRouter } from "h3";
import { listen } from "listhen";
import { createRequest } from "./handlers/createRequest";
import { executeRequest } from "./handlers/executeRequest";
import { getRequestEventStream } from "./handlers/getRequestEventStream";
import { setRequestOutput } from "./handlers/setRequestOutput";
import { getRequestInput } from "./handlers/getRequestInput";

const PORT = 8123;

const app = createApp();
const router = createRouter();

// Execute MaxScript code
router.post("/api/request/createRequest", createRequest);

router.post("/api/request/executeRequest/:requestId", executeRequest);

// SSE endpoint for result notifications
router.use(
  "/api/request/getRequestEventStream/:requestId",
  getRequestEventStream
);

// Receive results from MaxScript
router.post("/api/request/setRequestOutput/:requestId", setRequestOutput);

// Required for MaxScript to get the initial payload
router.get("/api/request/getRequestInput/:requestId", getRequestInput);

app.use(router);

try {
  await listen(toNodeListener(app), { port: PORT });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
