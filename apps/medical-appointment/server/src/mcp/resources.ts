import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots } from "../db/doctors.js";

const WEB_APP_URL = process.env.WEB_APP_URL || "http://localhost:5173";

function getWidgetHtml(): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Medical Appointment</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: transparent;
    }
    #root { min-height: 100px; }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="root"><div class="loading">Loading...</div></div>
  <script type="module" src="${WEB_APP_URL}/src/main.tsx"></script>
</body>
</html>`;
}

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
                text: getWidgetHtml(),
                _meta: {
                    "openai/widgetPrefersBorder": true,
                    "openai/widgetCSP": {
                        connect_domains: [WEB_APP_URL, "https://*.supabase.co"],
                        resource_domains: [WEB_APP_URL, "https://*.supabase.co"],
                    },
                },
            }],
        })
    );
    // 1. Direct Resource: List ALL doctors
    // URI: doctor://list
    server.registerResource(
        "list-doctors",
        "doctor://list",
        {
            title: "List of Doctors",
            description: "Returns all doctors registered in the system",
            mimeType: "application/json"
        },
        async (uri, _extra) => {
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

    // 2. Resource Template: Available Slots for a Doctor
    // URI: doctor://{id}/slots
    server.registerResource(
        "doctor-available-slots",
        new ResourceTemplate("doctor://{id}/slots", { list: undefined }),
        {
            title: "Available Slots",
            description: "Lists available appointment slots for a specific doctor",
            mimeType: "application/json"
        },
        async (uri, variables, _extra) => {
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
