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

// Mock data - 5 real properties in São Paulo, Brazil (2024 market data)
const MOCK_PROPERTIES: Property[] = [
    {
        id: "prop-001",
        title: "Apartamento de Luxo nos Jardins",
        price: 1850000,
        type: "apartamento",
        address: "Rua Estados Unidos, 1500 - Jardim América, São Paulo - SP",
        bedrooms: 3,
        bathrooms: 3,
        area: 145,
        lat: -23.5669,
        lng: -46.6725,
        image: "https://sdk-apps-openai-production.up.railway.app/images/prop-001.png",
        description: "Apartamento de alto padrão com acabamento premium, vista panorâmica e sacada gourmet. Condomínio completo com piscina, academia, salão de festas e segurança 24h.",
    },
    {
        id: "prop-002",
        title: "Casa Moderna em Pinheiros",
        price: 2200000,
        type: "casa",
        address: "Rua Fradique Coutinho, 850 - Pinheiros, São Paulo - SP",
        bedrooms: 4,
        bathrooms: 3,
        area: 220,
        lat: -23.5615,
        lng: -46.6893,
        image: "https://sdk-apps-openai-production.up.railway.app/images/prop-002.jpg",
        description: "Casa reformada com arquitetura contemporânea, jardim com deck, churrasqueira e piscina aquecida. Localização privilegiada perto do metrô Fradique Coutinho.",
    },
    {
        id: "prop-003",
        title: "Apartamento Charmoso na Vila Madalena",
        price: 980000,
        type: "apartamento",
        address: "Rua Harmonia, 344 - Vila Madalena, São Paulo - SP",
        bedrooms: 2,
        bathrooms: 2,
        area: 75,
        lat: -23.5483,
        lng: -46.6925,
        image: "https://sdk-apps-openai-production.up.railway.app/images/prop-003.png",
        description: "Apartamento decorado com estilo contemporâneo, sacada com churrasqueira e iluminação natural. Região vibrante com bares, galerias de arte e restaurantes.",
    },
    {
        id: "prop-004",
        title: "Apartamento Corporativo no Itaim Bibi",
        price: 1450000,
        type: "apartamento",
        address: "Av. Brigadeiro Faria Lima, 2232 - Itaim Bibi, São Paulo - SP",
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        lat: -23.5826,
        lng: -46.6855,
        image: "https://sdk-apps-openai-production.up.railway.app/images/prop-004.jpg",
        description: "Apartamento mobiliado de alto padrão, ideal para executivos. Prédio moderno com coworking, academia 24h, spa e localização estratégica na Faria Lima.",
    },
    {
        id: "prop-005",
        title: "Casa Espaçosa em Moema",
        price: 1750000,
        type: "casa",
        address: "Rua Ministro Jesuíno Cardoso, 567 - Moema, São Paulo - SP",
        bedrooms: 4,
        bathrooms: 4,
        area: 280,
        lat: -23.6004,
        lng: -46.6695,
        image: "https://sdk-apps-openai-production.up.railway.app/images/prop-005.jpg",
        description: "Casa ampla com quintal, piscina, área gourmet completa e hidromassagem. Excelente para famílias, perto do Parque Ibirapuera, escolas e comércio.",
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
        "openai/widgetCSP": {
            connect_domains: [
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
            ],
            resource_domains: [
                "https://maps.googleapis.com",
                "https://maps.gstatic.com",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
            ],
            script_domains: ["https://maps.googleapis.com"],
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

                // Build content array with images
                const contentItems: any[] = [{ type: "text", text: message }];

                // Add each property with image
                properties.forEach((p) => {
                    contentItems.push({
                        type: "image",
                        data: p.image,
                        mimeType: p.image.endsWith('.png') ? "image/png" : "image/jpeg",
                    });
                    contentItems.push({
                        type: "text",
                        text: `**${p.title}** - R$ ${p.price.toLocaleString('pt-BR')}\n${p.description}`,
                    });
                });

                return {
                    content: contentItems,
                    structuredContent: { properties },
                    _meta: toolDescriptorMeta(),
                };
            }

            if (name === "filter_by_price") {
                const parsed = priceParser.parse(args ?? {});
                const { maxPrice } = parsed;

                const properties = MOCK_PROPERTIES.filter((p) => p.price <= maxPrice);
                const message = `Found ${properties.length} properties under R$ ${maxPrice.toLocaleString("pt-BR")}`;

                // Build content array with images
                const contentItems: any[] = [{ type: "text", text: message }];

                // Add each property with image
                properties.forEach((p) => {
                    contentItems.push({
                        type: "image",
                        data: p.image,
                        mimeType: p.image.endsWith('.png') ? "image/png" : "image/jpeg",
                    });
                    contentItems.push({
                        type: "text",
                        text: `**${p.title}** - R$ ${p.price.toLocaleString('pt-BR')}\n${p.bedrooms} quartos • ${p.bathrooms} banheiros • ${p.area}m²`,
                    });
                });

                return {
                    content: contentItems,
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

        // Serve static images
        if (req.method === "GET" && url.pathname.startsWith("/images/")) {
            try {
                // Images are in project_root/public/images/
                // Remove leading / from pathname for proper join
                const relativePath = url.pathname.slice(1); // "/images/x.jpg" -> "images/x.jpg"
                const imagePath = join(process.cwd(), "public", relativePath);

                console.log(`[DEBUG] Serving image: ${imagePath}`);

                const ext = extname(imagePath).toLowerCase();
                const mimeTypes: { [key: string]: string } = {
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".png": "image/png",
                    ".gif": "image/gif",
                    ".webp": "image/webp",
                };
                const contentType = mimeTypes[ext] || "application/octet-stream";

                const imageData = readFileSync(imagePath);
                res.writeHead(200, {
                    "Content-Type": contentType,
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, max-age=86400", // 24h cache
                });
                res.end(imageData);
                return;
            } catch (error) {
                console.error("Error serving image:", error);
                res.writeHead(404).end("Image not found");
                return;
            }
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
