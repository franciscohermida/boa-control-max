import { createError, eventHandler, getValidatedRouterParams } from "h3";
import { pendingRequests } from "../utils/pendingRequests";
import { z } from "zod";
import { executeMaxCommand } from "../utils/executeMaxCommand";
import { resolve } from "pathe";

const PORT = 8123;
export const EXECUTE_MXS_SCRIPT_PATH = "./src/max-handlers/executeCode.ms";
export const EXECUTE_PY_SCRIPT_PATH = "./src/max-handlers/executeCode.py";

export const executeRequest = eventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, (params) => {
    return z.object({ requestId: z.string() }).parse(params);
  });

  const requestId = params.requestId;
  const pendingRequest = pendingRequests.get(requestId);

  const lang = pendingRequest?.input?.lang;

  const scriptPath =
    lang === "py" ? EXECUTE_PY_SCRIPT_PATH : EXECUTE_MXS_SCRIPT_PATH;

  if (!pendingRequest) {
    throw createError({
      statusCode: 404,
      message: "No pending request found",
    });
  }

  try {
    console.log(`Executing ${lang} command for requestId:`, requestId);
    await executeMaxCommand({
      lang,
      scriptPath: resolve(scriptPath),
      requestId,
      url: `http://localhost:${PORT}`,
    });

    return { requestId };
  } catch (error) {
    console.error(`Failed to execute ${lang} command:`, error);
    pendingRequests.delete(requestId);
    clearTimeout(pendingRequest.timeout);
    throw createError({
      statusCode: 500,
      message: `Failed sending ${lang} command to 3ds Max`,
    });
  }
});
