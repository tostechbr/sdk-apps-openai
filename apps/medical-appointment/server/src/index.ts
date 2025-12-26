import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./mcp/resources.js";
import { registerTools } from "./mcp/tools.js";

const server = new McpServer({
    name: "medical-appointment",
    version: "0.1.0",
});

registerResources(server);
registerTools(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Medical Appointment MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
