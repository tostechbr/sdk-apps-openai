import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerResources } from "./mcp/resources.js";
import { registerTools } from "./mcp/tools.js";

const PORT = Number(process.env.PORT ?? 3001);
const MCP_PATH = "/mcp";

function createMcpServer(): McpServer {
    const server = new McpServer({
        name: "medical-appointment",
        version: "0.1.0",
    });

    registerResources(server);
    registerTools(server);

    return server;
}

function setCorsHeaders(res: ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, mcp-session-id");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!req.url) {
        res.writeHead(400).end("Missing URL");
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    // CORS preflight
    if (req.method === "OPTIONS") {
        setCorsHeaders(res);
        res.writeHead(204).end();
        return;
    }

    // Health check
    if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ status: "ok", name: "medical-appointment", version: "0.1.0" }));
        return;
    }

    // MCP endpoint
    const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
    if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
        setCorsHeaders(res);

        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // stateless mode
            enableJsonResponse: true,
        });

        res.on("close", () => {
            transport.close();
            server.close();
        });

        try {
            await server.connect(transport);
            await transport.handleRequest(req, res);
        } catch (error) {
            console.error("Error handling MCP request:", error);
            if (!res.headersSent) {
                res.writeHead(500).end("Internal server error");
            }
        }
        return;
    }

    res.writeHead(404).end("Not Found");
}

const httpServer = createServer(handleRequest);

httpServer.listen(PORT, () => {
    console.log(`Medical Appointment MCP Server listening on http://localhost:${PORT}${MCP_PATH}`);
});
