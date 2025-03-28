import { EventSource } from "eventsource";

const MAX_SERVER_URL = "http://localhost:8123";

type MaxResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Creates an SSE connection and waits for the result
 */
const waitForResult = async <T>(
  requestId: string,
  timeoutMs: number = 30000
): Promise<MaxResult<T>> => {
  return new Promise(async (resolve, reject) => {
    const eventSource = new EventSource(
      `${MAX_SERVER_URL}/api/request/getRequestEventStream/${requestId}`
    );
    const timeout = setTimeout(() => {
      eventSource.close();
      reject(new Error("Timeout waiting for MaxScript execution"));
    }, timeoutMs);

    eventSource.onmessage = (event) => {
      // console.log("SSE Received message:", event.data);
      const data = JSON.parse(event.data) as MaxResult<T>;
      clearTimeout(timeout);
      eventSource.close();
      resolve(data);
    };

    eventSource.onerror = (event) => {
      clearTimeout(timeout);
      eventSource.close();
      reject(new Error("SSE Error in connection: " + event.message));
    };

    const response = await fetch(
      `${MAX_SERVER_URL}/api/request/executeRequest/${requestId}`,
      {
        method: "POST",
      }
    );
  });
};

/**
 * Executes code and returns the result
 * @param code The code to execute
 * @returns A promise that resolves with the result
 */
const executeCode = async <T = any>({
  lang,
  code,
  timeoutMs = 30000,
}: {
  lang: "mxs" | "py";
  code: string;
  timeoutMs?: number;
}): Promise<MaxResult<T>> => {
  const response = await fetch(`${MAX_SERVER_URL}/api/request/createRequest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "executeCode", data: { lang, code } }),
  });

  const result = await response.json();

  return waitForResult<T>(result.requestId, timeoutMs);
};

export const maxClient = {
  executeCode,
};