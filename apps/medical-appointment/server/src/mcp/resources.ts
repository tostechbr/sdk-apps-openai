import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots } from "../db/doctors.js";

export function registerResources(server: McpServer) {
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
