import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots } from "../db/doctors.js";

// Resolve paths relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load widget HTML from file (clean separation of concerns)
const WIDGET_HTML = readFileSync(
    join(__dirname, "..", "..", "public", "widget.html"),
    "utf8"
);

export function registerResources(server: McpServer) {
    // UI Widget Template - Main entry point for ChatGPT
    server.registerResource(
        "medical-app-widget",
        "ui://widget/medical-app.html",
        {
            title: "Medical Appointment Widget",
            description: "Interactive widget for searching doctors and scheduling appointments",
            mimeType: "text/html+skybridge",
        },
        async () => ({
            contents: [{
                uri: "ui://widget/medical-app.html",
                mimeType: "text/html+skybridge",
                text: WIDGET_HTML,
                _meta: {
                    "openai/widgetPrefersBorder": true,
                    "openai/widgetCSP": {
                        connect_domains: ["https://*.supabase.co"],
                        resource_domains: ["https://*.supabase.co"],
                    },
                },
            }],
        })
    );

    // Direct Resource: List ALL doctors
    server.registerResource(
        "list-doctors",
        "doctor://list",
        {
            title: "List of Doctors",
            description: "Returns all doctors registered in the system",
            mimeType: "application/json"
        },
        async (uri) => {
            try {
                const doctors = await listDoctors();
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify(doctors, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "text/plain",
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`
                    }]
                };
            }
        }
    );

    // Resource Template: Available Slots for a Doctor
    server.registerResource(
        "doctor-available-slots",
        new ResourceTemplate("doctor://{id}/slots", { list: undefined }),
        {
            title: "Available Slots",
            description: "Lists available appointment slots for a specific doctor",
            mimeType: "application/json"
        },
        async (uri, variables) => {
            try {
                const doctorId = variables.id as string;
                const slots = await getAvailableSlots(doctorId);

                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "application/json",
                        text: JSON.stringify({
                            doctorId,
                            count: slots.length,
                            slots: slots.map(s => ({
                                id: s.id,
                                time: s.slot_time,
                                available: s.is_available
                            }))
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    contents: [{
                        uri: uri.href,
                        mimeType: "text/plain",
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`
                    }]
                };
            }
        }
    );
}
