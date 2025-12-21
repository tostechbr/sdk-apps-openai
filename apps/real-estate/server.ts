import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from "node:http";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    type CallToolRequest,
    type ListResourceTemplatesRequest,
    type ListResourcesRequest,
    type ListToolsRequest,
    type ReadResourceRequest,
    type Resource,
    type ResourceTemplate,
    type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Types
type Property = {
    id: string;
    title: string;
    price: number;
    type: "casa" | "apartamento";
    address: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    lat: number;
    lng: number;
    image: string;
    description: string;
};

type SessionRecord = {
    server: Server;
    transport: SSEServerTransport;
};

// Mock data - 2 properties in São Paulo, Brazil
const MOCK_PROPERTIES: Property[] = [
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
        description: "Linda casa moderna com quintal",
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
        description: "Apartamento moderno próximo ao metrô",
    },
];

// Load widget HTML
const widgetHtml = readFileSync("public/widget.html", "utf8");

// Template configuration
const TEMPLATE_URI = "ui://widget/real-estate.html";
const MIME_TYPE = "text/html+skybridge";

// Input schemas
const searchPropertiesSchema = {
    type: "object" as const,
    properties: {
        filter: {
            type: "string" as const,
            enum: ["all", "casa", "apartamento"] as const,
            description: "Filter by property type",
        },
    },
    additionalProperties: false,
};

const filterByPriceSchema = {
    type: "object" as const,
    properties: {
        maxPrice: {
            type: "number" as const,
            description: "Maximum price in BRL",
        },
    },
    required: ["maxPrice"],
    additionalProperties: false,
};

// Zod parsers
const searchParser = z.object({
    filter: z.enum(["all", "casa", "apartamento"]).optional(),
});

const priceParser = z.object({
    maxPrice: z.number().positive(),
});

// Tool metadata
function toolDescriptorMeta() {
    return {
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Searching properties...",
        "openai/toolInvocation/invoked": "Properties found",
        "openai/widgetAccessible": true,
    } as const;
}

// Tools definitions
const tools: Tool[] = [
    {
        name: "search_properties",
        title: "Search Properties",
        description:
            "Search for real estate properties. Can filter by type (casa or apartamento).",
        inputSchema: searchPropertiesSchema,
        _meta: toolDescriptorMeta(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
    },
    {
        name: "filter_by_price",
        title: "Filter by Price",
        description: "Filter properties by maximum price in BRL.",
        inputSchema: filterByPriceSchema,
        _meta: toolDescriptorMeta(),
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: false,
        },
    },
];

// Resources
const resources: Resource[] = [
    {
        uri: TEMPLATE_URI,
        name: "Real Estate Widget",
        description: "Interactive property map widget",
        mimeType: MIME_TYPE,
        _meta: toolDescriptorMeta(),
    },
];

const resourceTemplates: ResourceTemplate[] = [
    {
        uriTemplate: TEMPLATE_URI,
        name: "Real Estate Widget Template",
        description: "Interactive property map widget",
        mimeType: MIME_TYPE,
        _meta: toolDescriptorMeta(),
    },
];

// Create MCP Server
function createRealEstateServer(): Server {
    const server = new Server(
        {
            name: "real-estate-map",
            version: "1.0.0",
        },
        {
            capabilities: {
                resources: {},
                tools: {},
            },
        }
    );

    // List resources
    server.setRequestHandler(
        ListResourcesRequestSchema,
        async (_request: ListResourcesRequest) => ({
            resources,
        })
    );

    // Read resource
    server.setRequestHandler(
        ReadResourceRequestSchema,
        async (request: ReadResourceRequest) => {
            if (request.params.uri === TEMPLATE_URI) {
                return {
                    contents: [
                        {
                            uri: TEMPLATE_URI,
                            mimeType: MIME_TYPE,
                            text: widgetHtml,
                            _meta: toolDescriptorMeta(),
                        },
                    ],
                };
            }
            throw new Error(`Unknown resource: ${request.params.uri}`);
        }
    );

    // List resource templates
    server.setRequestHandler(
        ListResourceTemplatesRequestSchema,
        async (_request: ListResourceTemplatesRequest) => ({
            resourceTemplates,
        })
    );

    // List tools
    server.setRequestHandler(
        ListToolsRequestSchema,
        async (_request: ListToolsRequest) => ({
            tools,
        })
    );

    // Handle tool calls
    server.setRequestHandler(
        CallToolRequestSchema,
        async (request: CallToolRequest) => {
            const { name, arguments: args } = request.params;

            if (name === "search_properties") {
                const parsed = searchParser.parse(args ?? {});
                const filter = parsed.filter || "all";

                let properties = MOCK_PROPERTIES;
                if (filter !== "all") {
                    properties = MOCK_PROPERTIES.filter((p) => p.type === filter);
                }

                const message =
                    filter === "all"
                        ? `Found ${properties.length} properties`
                        : `Found ${properties.length} ${filter}(s)`;

                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { properties },
                    _meta: toolDescriptorMeta(),
                };
            }

            if (name === "filter_by_price") {
                const parsed = priceParser.parse(args ?? {});
                const { maxPrice } = parsed;

                const properties = MOCK_PROPERTIES.filter((p) => p.price <= maxPrice);
                const message = `Found ${properties.length} properties under R$ ${maxPrice.toLocaleString("pt-BR")}`;

                return {
                    content: [{ type: "text", text: message }],
                    structuredContent: { properties },
                    _meta: toolDescriptorMeta(),
                };
            }

            throw new Error(`Unknown tool: ${name}`);
        }
    );

    return server;
}

// Session management
const sessions = new Map<string, SessionRecord>();

// Paths
const ssePath = "/mcp";
const postPath = "/mcp/messages";

// Handle SSE connection
async function handleSseRequest(res: ServerResponse): Promise<void> {
    res.setHeader("Access-Control-Allow-Origin", "*");

    const server = createRealEstateServer();
    const transport = new SSEServerTransport(postPath, res);
    const sessionId = transport.sessionId;

    sessions.set(sessionId, { server, transport });

    transport.onclose = async () => {
        sessions.delete(sessionId);
        await server.close();
    };

    transport.onerror = (error) => {
        console.error("SSE transport error:", error);
    };

    try {
        await server.connect(transport);
    } catch (error) {
        sessions.delete(sessionId);
        console.error("Failed to start SSE session:", error);
        if (!res.headersSent) {
            res.writeHead(500).end("Failed to establish SSE connection");
        }
    }
}

// Handle POST messages
async function handlePostMessage(
    req: IncomingMessage,
    res: ServerResponse,
    url: URL
): Promise<void> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type");

    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
        res.writeHead(400).end("Missing sessionId query parameter");
        return;
    }

    const session = sessions.get(sessionId);

    if (!session) {
        res.writeHead(404).end("Unknown session");
        return;
    }

    try {
        await session.transport.handlePostMessage(req, res);
    } catch (error) {
        console.error("Failed to process message:", error);
        if (!res.headersSent) {
            res.writeHead(500).end("Failed to process message");
        }
    }
}

// Server setup
const portEnv = Number(process.env.PORT ?? 8787);
const port = Number.isFinite(portEnv) ? portEnv : 8787;

const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
        if (!req.url) {
            res.writeHead(400).end("Missing URL");
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

        // CORS preflight
        if (
            req.method === "OPTIONS" &&
            (url.pathname === ssePath || url.pathname === postPath)
        ) {
            res.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "content-type",
            });
            res.end();
            return;
        }

        // SSE endpoint
        if (req.method === "GET" && url.pathname === ssePath) {
            await handleSseRequest(res);
            return;
        }

        // POST messages endpoint
        if (req.method === "POST" && url.pathname === postPath) {
            await handlePostMessage(req, res, url);
            return;
        }

        // Health check
        if (req.method === "GET" && url.pathname === "/") {
            res
                .writeHead(200, { "content-type": "text/plain" })
                .end("Real Estate Map MCP Server");
            return;
        }

        res.writeHead(404).end("Not Found");
    }
);

httpServer.on("clientError", (err: Error, socket) => {
    console.error("HTTP client error:", err);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

httpServer.listen(port, () => {
    console.log(
        `Real Estate Map MCP server listening on http://localhost:${port}`
    );
    console.log(`  SSE stream: GET http://localhost:${port}${ssePath}`);
    console.log(
        `  Message post: POST http://localhost:${port}${postPath}?sessionId=...`
    );
});
