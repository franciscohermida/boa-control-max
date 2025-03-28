import { MaxTcpClient } from "./maxTcpClient";

interface ExecuteMaxScriptOptions {
  lang: "mxs" | "python";
  scriptPath: string;
  requestId: string;
  url: string;
}

export async function executeMaxCommand(options: ExecuteMaxScriptOptions) {
  const client = MaxTcpClient.getInstance();
  try {
    await client.sendRequest(options);
  } catch (error) {
    throw new Error(`Failed to execute MaxScript command: ${error}`);
  }
}
