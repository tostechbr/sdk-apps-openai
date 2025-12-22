/**
 * Application Constants
 * Magic numbers and configuration values
 */

export const MAP_CONFIG = {
    DEFAULT_CENTER: { lat: -23.5505, lng: -46.6333 } as const,
    DEFAULT_ZOOM: 12,
    DETAIL_ZOOM: 15,
    MAP_HEIGHT: "400px",
} as const;

export const CARD_CONFIG = {
    IMAGE_HEIGHT: "200px",
    CONTAINER_MAX_WIDTH: "800px",
    GRID_MIN_WIDTH: "300px",
} as const;

export const CSP_DOMAINS = {
    CONNECT: [
        "https://maps.googleapis.com",
        "https://maps.gstatic.com",
    ] as const,
    RESOURCE: [
        "https://maps.googleapis.com",
        "https://maps.gstatic.com",
        "https://*.googleapis.com",
        "https://*.gstatic.com",
    ] as const,
    SCRIPT: ["https://maps.googleapis.com"] as const,
} as const;
