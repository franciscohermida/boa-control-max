import { Socket } from "net";
import path from "pathe";

interface MaxRequest {
  lang: "mxs" | "py";
  scriptPath: string;
  requestId: string;
  url: string;
}

export class MaxTcpClient {
  private static instance: MaxTcpClient;
  private socket: Socket | null = null;
  private connected = false;
  private readonly host = "127.0.0.1";
  private readonly port = 7603;

  private constructor() {
    this.socket = new Socket();
    this.setupSocketHandlers();
  }

  public static getInstance(): MaxTcpClient {
    if (!MaxTcpClient.instance) {
      MaxTcpClient.instance = new MaxTcpClient();
    }
    return MaxTcpClient.instance;
  }

  private setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.connected = true;
    });

    this.socket.on("close", () => {
      this.connected = false;
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.connected = false;
    });
  }

  private async ensureConnection(): Promise<void> {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.socket = new Socket();
        this.setupSocketHandlers();
      }

      this.socket.connect(this.port, this.host, () => {
        this.connected = true;
        resolve();
      });

      this.socket.once("error", (error) => {
        reject(error);
      });
    });
  }

  public async sendRequest(request: MaxRequest): Promise<string> {
    try {
      await this.ensureConnection();

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error("Socket not initialized"));
          return;
        }

        const handleData = (data: Buffer) => {
          this.socket?.removeListener("data", handleData);
          resolve(data.toString().trim());
        };

        this.socket.on("data", handleData);

        let wrappedScript: string;

        if (request.lang === "py") {
          // Use Python event handler for Python code
          const eventHandlerScriptPath = path.resolve(
            "./src/max-handlers/eventHandler.py"
          );
          wrappedScript = `
import sys
sys.path.append("${path.dirname(eventHandlerScriptPath)}")
from eventHandler import event_handler
event_handler("${request.scriptPath}", "${request.requestId}", "${request.url}")
          `.trim();
        } else {
          // Use MaxScript event handler for MaxScript code
          const eventHandlerScriptPath = path.resolve(
            "./src/max-handlers/eventHandler.ms"
          );
          wrappedScript = `(include @"${eventHandlerScriptPath}") "${request.scriptPath}" "${request.requestId}" "${request.url}"`;
        }

        console.log(`Sending ${request.lang} request to 3ds Max`);
        this.socket.write(
          JSON.stringify({
            lang: request.lang,
            code: wrappedScript,
          }) + "\n"
        );
      });
    } catch (error) {
      throw new Error(`Failed to send request to 3ds Max: ${error}`);
    }
  }

  public disconnect() {
    if (this.socket && this.connected) {
      this.socket.write("socketClosing");
      this.socket.end();
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
    }
  }
}
