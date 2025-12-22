/**
 * Application Configuration
 * Centralized configuration management
 */

export const config = {
    // Server
    PORT: Number(process.env.PORT || 8787),
    NODE_ENV: process.env.NODE_ENV || "development",

    // URLs
    BASE_URL: process.env.BASE_URL || "http://localhost:8787",

    // Google Maps
    GOOGLE_MAPS_API_KEY:
        process.env.GOOGLE_MAPS_API_KEY,

    // MCP
    MCP_SSE_PATH: "/mcp",
    MCP_POST_PATH: "/mcp/messages",

    // Widget
    TEMPLATE_URI: "ui://widget/real-estate.html",
    MIME_TYPE: "text/html+skybridge",
} as const;

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
