/**
 * Simple Logger Utility
 * Prevents debug logs in production
 */

import { isDevelopment } from "../config/env.js";

export const logger = {
    debug(...args: any[]): void {
        if (isDevelopment) {
            console.log("[DEBUG]", ...args);
        }
    },

    info(...args: any[]): void {
        console.log("[INFO]", ...args);
    },

    error(...args: any[]): void {
        console.error("[ERROR]", ...args);
    },

    warn(...args: any[]): void {
        console.warn("[WARN]", ...args);
    },
};
