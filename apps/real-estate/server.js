import { createServer } from "http";
import { readFileSync } from "fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// Mock data - 2 properties in São Paulo, Brazil
const MOCK_PROPERTIES = [
    {
        id: "prop-1",
        title: "Casa Moderna em Pinheiros",
        price: 850000,
        type: "casa",
        address: "Rua dos Pinheiros, 123 - Pinheiros, São Paulo - SP",
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        lat: -23.5629,
        lng: -46.6822,
        image: "🏡",
        description: "Linda casa moderna com quintal"
    },
    {
        id: "prop-2",
        title: "Apartamento no Itaim Bibi",
        price: 620000,
        type: "apartamento",
        address: "Av. Brigadeiro Faria Lima, 456 - Itaim Bibi, São Paulo - SP",
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        lat: -23.5875,
        lng: -46.6814,
        image: "🏢",
        description: "Apartamento moderno próximo ao metrô"
    }
];

// Load widget HTML
const widgetHtml = readFileSync("public/widget.html", "utf8");

// Input schemas
const searchPropertiesSchema = {
    filter: z.enum(["all", "casa", "apartamento"]).optional()
};

const filterByPriceSchema = {
    maxPrice: z.number().positive()
};

// Helper function to return properties with structured content
const replyWithProperties = (properties, message) => ({
    content: message ? [{ type: "text", text: message }] : [],
    structuredContent: { properties }
});

// Create MCP server
function createRealEstateServer() {
    const server = new McpServer({
        name: "real-estate-map",
        version: "1.0.0"
    });

    // Register widget resource
    server.registerResource(
        "real-estate-widget",
        "ui://widget/real-estate.html",
        {},
        async () => ({
            contents: [
                {
                    uri: "ui://widget/real-estate.html",
                    mimeType: "text/html+skybridge",
                    text: widgetHtml,
                    _meta: {
                        "openai/widgetPrefersBorder": true,
                        "openai/widgetDescription": "Interactive map showing real estate properties",
                        "openai/widgetCSP": {
                            connect_domains: ["https://unpkg.com"],
                            resource_domains: ["https://unpkg.com", "https://*.openstreetmap.org"]
                        }
                    }
                }
            ]
        })
    );

    // Tool 1: Search properties
    server.registerTool(
        "search_properties",
        {
            title: "Search Properties",
            description: "Search for real estate properties. Can filter by type (casa or apartamento).",
            inputSchema: searchPropertiesSchema,
            _meta: {
                "openai/outputTemplate": "ui://widget/real-estate.html",
                "openai/toolInvocation/invoking": "Searching properties...",
                "openai/toolInvocation/invoked": "Properties found",
                "openai/widgetAccessible": true
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async (args) => {
            const filter = args?.filter || "all";

            let properties = MOCK_PROPERTIES;
            if (filter !== "all") {
                properties = MOCK_PROPERTIES.filter(p => p.type === filter);
            }

            const message = filter === "all"
                ? `Found ${properties.length} properties`
                : `Found ${properties.length} ${filter}(s)`;

            return replyWithProperties(properties, message);
        }
    );

    // Tool 2: Filter by price
    server.registerTool(
        "filter_by_price",
        {
            title: "Filter by Price",
            description: "Filter properties by maximum price in BRL.",
            inputSchema: filterByPriceSchema,
            _meta: {
                "openai/outputTemplate": "ui://widget/real-estate.html",
                "openai/toolInvocation/invoking": "Filtering by price...",
                "openai/toolInvocation/invoked": "Filtered properties",
                "openai/widgetAccessible": true
            },
            annotations: {
                readOnlyHint: true
            }
        },
        async (args) => {
            const maxPrice = args?.maxPrice;
            if (!maxPrice) {
                return replyWithProperties(MOCK_PROPERTIES, "Please provide a maximum price.");
            }

            const properties = MOCK_PROPERTIES.filter(p => p.price <= maxPrice);
            const message = `Found ${properties.length} properties under R$ ${maxPrice.toLocaleString('pt-BR')}`;

            return replyWithProperties(properties, message);
        }
    );

    return server;
}

// Server setup
const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
    if (!req.url) {
        res.writeHead(400).end("Missing URL");
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    // CORS preflight
    if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
            "Access-Control-Allow-Headers": "content-type, mcp-session-id",
            "Access-Control-Expose-Headers": "Mcp-Session-Id"
        });
        res.end();
        return;
    }

    // Health check
    if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, { "content-type": "text/plain" })
            .end("Real Estate Map MCP Server");
        return;
    }

    // MCP endpoint
    const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
    if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

        const server = createRealEstateServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // stateless mode
            enableJsonResponse: true
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
});

httpServer.listen(port, () => {
    console.log(`Real Estate Map MCP server listening on http://localhost:${port}${MCP_PATH}`);
});
