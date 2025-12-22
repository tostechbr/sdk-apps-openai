import {
    createServer,
    type IncomingMessage,
    type ServerResponse,
} from "node:http";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { join, extname } from "node:path";
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

// Internal imports
import { config } from "./src/config/env.js";
import { CSP_DOMAINS } from "./src/config/constants.js";
import { PROPERTIES } from "./src/data/properties.js";
import type { Property } from "./src/data/types.js";
import { formatPrice, formatPropertyDetails } from "./src/utils/formatters.js";
import { logger } from "./src/utils/logger.js";

// Session management type
type SessionRecord = {
    server: Server;
    transport: SSEServerTransport;
};

// Load widget HTML
const widgetHtml = readFileSync("public/widget.html", "utf8");

// Template configuration (from config)
const TEMPLATE_URI = config.TEMPLATE_URI;
const MIME_TYPE = config.MIME_TYPE;

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
        minPrice: {
            type: "number" as const,
            description: "Minimum price in BRL (optional)",
        },
        maxPrice: {
            type: "number" as const,
            description: "Maximum price in BRL (optional)",
        },
    },
    additionalProperties: false,
};

// Zod parsers
const searchParser = z.object({
    filter: z.enum(["all", "casa", "apartamento"]).optional(),
});

const priceParser = z.object({
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
}).refine(
    (data) => data.minPrice !== undefined || data.maxPrice !== undefined,
    { message: "At least one of minPrice or maxPrice must be provided" }
);

// Tool metadata
function toolDescriptorMeta() {
    return {
        "openai/outputTemplate": TEMPLATE_URI,
        "openai/toolInvocation/invoking": "Searching properties...",
        "openai/toolInvocation/invoked": "Properties found",
        "openai/widgetAccessible": true,
        "openai/widgetCSP": {
            connect_domains: [...CSP_DOMAINS.CONNECT],
            resource_domains: [...CSP_DOMAINS.RESOURCE],
            script_domains: [...CSP_DOMAINS.SCRIPT],
        },
        "openai/widgetDomain": "https://chatgpt.com",
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
        description: "Filter properties by price range in BRL. Supports minPrice (properties above), maxPrice (properties below), or both for a range.",
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

                let properties = PROPERTIES;
                if (filter !== "all") {
                    properties = PROPERTIES.filter((p) => p.type === filter);
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
                const { minPrice, maxPrice } = parsed;

                // Filter properties by price range
                let properties = PROPERTIES;

                if (minPrice !== undefined && maxPrice !== undefined) {
                    // Both min and max provided - range filter
                    properties = PROPERTIES.filter(
                        (p: Property) => p.price >= minPrice && p.price <= maxPrice
                    );
                } else if (minPrice !== undefined) {
                    // Only min provided - properties above price
                    properties = PROPERTIES.filter(
                        (p: Property) => p.price >= minPrice
                    );
                } else if (maxPrice !== undefined) {
                    // Only max provided - properties below price
                    properties = PROPERTIES.filter(
                        (p: Property) => p.price <= maxPrice
                    );
                }

                // Build descriptive message
                let message = "";
                if (minPrice !== undefined && maxPrice !== undefined) {
                    message = `Found ${properties.length} properties between ${formatPrice(minPrice)} and ${formatPrice(maxPrice)}`;
                } else if (minPrice !== undefined) {
                    message = `Found ${properties.length} properties above ${formatPrice(minPrice)}`;
                } else if (maxPrice !== undefined) {
                    message = `Found ${properties.length} properties under ${formatPrice(maxPrice)}`;
                }

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

// Paths (from config)
const ssePath = config.MCP_SSE_PATH;
const postPath = config.MCP_POST_PATH;

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
        logger.error("SSE transport error:", error);
    };

    try {
        await server.connect(transport);
    } catch (error) {
        sessions.delete(sessionId);
        logger.error("Failed to start SSE session:", error);
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
        logger.error("Failed to process message:", error);
        if (!res.headersSent) {
            res.writeHead(500).end("Failed to process message");
        }
    }
}

// Server setup
const port = config.PORT;

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

        // Serve static files (images, JS, CSS)
        if (req.method === "GET" && url.pathname.startsWith("/")) {
            // Skip MCP endpoints
            if (url.pathname === ssePath || url.pathname === postPath || url.pathname === "/") {
                // Continue to next handler
            } else {
                try {
                    // Try to serve from public directory
                    const relativePath = url.pathname.slice(1); // Remove leading /
                    const filePath = join(process.cwd(), "public", relativePath);

                    logger.debug("Serving static file:", filePath);

                    const ext = extname(filePath).toLowerCase();
                    const mimeTypes: { [key: string]: string } = {
                        ".html": "text/html",
                        ".js": "text/javascript", // Important for ES6 modules!
                        ".mjs": "text/javascript",
                        ".css": "text/css",
                        ".json": "application/json",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".png": "image/png",
                        ".gif": "image/gif",
                        ".webp": "image/webp",
                        ".svg": "image/svg+xml",
                    };
                    const contentType = mimeTypes[ext] || "application/octet-stream";

                    const fileData = readFileSync(filePath);
                    res.writeHead(200, {
                        "Content-Type": contentType,
                        "Access-Control-Allow-Origin": "*",
                        "Cache-Control": "public, max-age=86400", // 24h cache
                    });
                    res.end(fileData);
                    return;
                } catch (error) {
                    // File not found, continue to 404
                }
            }
        }

        res.writeHead(404).end("Not Found");
    }
);

httpServer.on("clientError", (err: Error, socket) => {
    logger.error("HTTP client error:", err);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

httpServer.listen(port, () => {
    logger.info(
        `Real Estate Map MCP server listening on http://localhost:${port}`
    );
    logger.info(`  SSE stream: GET http://localhost:${port}${config.MCP_SSE_PATH}`);
    logger.info(
        `  Message post: POST http://localhost:${port}${config.MCP_POST_PATH}?sessionId=...`
    );
});
