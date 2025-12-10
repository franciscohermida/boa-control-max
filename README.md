# BOA Control Max

A bridge for executing MaxScript and Python code in 3ds Max through TCP and HTTP endpoints. This project allows external applications to interact with 3ds Max, executing scripts remotely and receiving results.

## Overview

BOA Control Max consists of two main components:

1. **Max Server (HTTP)**: Provides HTTP endpoints for executing code in 3ds Max
2. **Max MCP Server**: Enables AI tools (via the Model Context Protocol) to execute code in 3ds Max

## Installation

```bash
# Clone the repository
git clone https://github.com/franciscohermida/boa-control-max.git

# Install dependencies
cd boa-control-max

# You must have installed Node.js and pnpm
pnpm install

# Start the server
cd packages/max-server
pnpm run dev
```

## Setup

### 3ds Max

Execute the following python script to start the tcp server in 3ds Max:

```
./packages/max-server/src/max-utils/maxPyTcpServer.py
```

This will create a TCP server within 3ds Max that can receive and execute commands from the HTTP server.

### MCP Client (Cursor)

The repository includes a `.cursor/mcp.json` file that configures the MCP server. To enable:

1. Enable MCP Server in Cursor settings

## Architecture

The system operates through the following components:

1. **HTTP Server**: Receives API requests from clients, send events to 3ds max, provides input and output endpoints to 3ds Max
2. **TCP Server (in 3ds Max)**: Receives events from the HTTP server and executes code in 3ds Max
3. **Event Handler (in 3ds Max)**: Executes functions for each event and returns results
4. **MCP Server**: Provides an AI-friendly interface to the HTTP server

### Flow:

1. MCP Client (Cursor) sends a request to the HTTP server
2. HTTP server creates a request ID and forwards it to 3ds Max via TCP
3. 3ds Max retrieves the payload via HTTP
4. 3ds Max executes the code and returns results via HTTP
5. Client receives execution results

## API Usage

The server supports both MaxScript and Python execution:

```javascript
// Example: Execute MaxScript code
const response = await fetch("/api/request/createRequest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "executeCode",
    lang: "mxs", // Use 'mxs' for MaxScript (default) or 'py' for Python
    data: { code: "sphere radius:50 wirecolor:red" },
  }),
});
```

### API Endpoints

- **POST /api/request/createRequest**: Create a new execution request
- **POST /api/request/executeRequest/:requestId**: Execute a request
- **GET /api/request/getRequestEventStream/:requestId**: SSE endpoint for result notifications
- **POST /api/request/setRequestOutput/:requestId**: Receive results from code execution
- **GET /api/request/getRequestInput/:requestId**: Get the initial payload for a request

## MCP Server Integration

The MCP server allows AI tools (like Cursor) to execute code in 3ds Max through a standardized interface.

### Using Other AI Tools

For integration with other AI tools that support the Model Context Protocol:

1. Add the MCP server configuration to your tool's settings
2. Use the MCP server to execute code in 3ds Max

## Implementation Details

The server uses parallel language handlers for MaxScript and Python:

- **MaxScript**: Uses `eventHandler.ms` and `executeCode.ms`
- **Python**: Uses `eventHandler.py` and `executeCode.py`

The dual implementation enables comparing capabilities and performance between the two scripting languages.

## Other MCP Servers:
- Blender MCP: https://github.com/ahujasid/blender-mcp
- Unity MCP: https://github.com/justinpbarnett/unity-mcp
- Unreal Engine Generative AI Support Plugin: https://github.com/prajwalshettydev/UnrealGenAISupport

## TODO

- [ ] Simplify installation for non-developers
- [ ] Improve MCP server setup for users not using Cursor
- [ ] Add documentation for common use cases
