import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { maxClient } from "./utils/maxClient";
import { executeMxsCode } from "./tools/executeMxsCode";
import { executePyCode } from "./tools/executePyCode";

const server = new McpServer({
  name: "3ds Max MCP Server",
  version: "1.0.0",
});

server.tool(
  executeMxsCode.name,
  executeMxsCode.description,
  {
    code: z.string().describe("The maxscript code to execute"),
  },
  async ({ code }) => {
    let result: string | undefined = undefined;
    try {
      const response = await maxClient.executeCode({ lang: "mxs", code });
      result = JSON.stringify(response);
    } catch (error) {
      result = `Error: ${error.message}`;
    }
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

server.tool(
  executePyCode.name,
  executePyCode.description,
  {
    code: z.string().describe("The python code to execute"),
  },
  async ({ code }) => {
    let result: string | undefined = undefined;
    try {
      const response = await maxClient.executeCode({ lang: "py", code });
      result = JSON.stringify(response);
    } catch (error) {
      result = `Error: ${error.message}`;
    }
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

await server.connect(new StdioServerTransport());
