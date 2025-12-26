import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots } from "../db/doctors.js";

export function registerResources(server: McpServer) {
    // 1. Direct Resource: List ALL doctors
    // URI: doctor://list
    server.registerResource(
        "list-doctors",
        "doctor://list",
        {
            title: "Lista de Médicos",
            description: "Retorna todos os médicos cadastrados no sistema",
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

    // 2. Resource Template: Filter by Specialty
    // Pattern: doctor://list/specialty/{name}
    server.registerResource(
        "list-doctors-by-specialty",
        new ResourceTemplate("doctor://list/specialty/{name}", { list: undefined }),
        {
            title: "Médicos por Especialidade",
            description: "Filtra médicos por especialidade (ex: Cardiologista, Pediatra)",
            mimeType: "application/json"
        },
        async (uri, variables, _extra) => {
            try {
                const specialty = decodeURIComponent(variables.name as string);
                const doctors = await listDoctors({ specialty });
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

    // 3. Resource Template: Filter by City
    // Pattern: doctor://list/city/{name}
    server.registerResource(
        "list-doctors-by-city",
        new ResourceTemplate("doctor://list/city/{name}", { list: undefined }),
        {
            title: "Médicos por Cidade",
            description: "Filtra médicos por cidade (ex: São Paulo, Rio de Janeiro)",
            mimeType: "application/json"
        },
        async (uri, variables, _extra) => {
            try {
                const city = decodeURIComponent(variables.name as string);
                const doctors = await listDoctors({ city });
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

    // 4. Resource Template: Filter by State
    // Pattern: doctor://list/state/{uf}
    server.registerResource(
        "list-doctors-by-state",
        new ResourceTemplate("doctor://list/state/{uf}", { list: undefined }),
        {
            title: "Médicos por Estado",
            description: "Filtra médicos por UF (ex: SP, RJ, MG)",
            mimeType: "application/json"
        },
        async (uri, variables, _extra) => {
            try {
                const doctors = await listDoctors({ state: variables.uf as string });
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

    // 5. Resource Template: Available Slots for a Doctor
    // Pattern: doctor://{id}/slots
    server.registerResource(
        "doctor-available-slots",
        new ResourceTemplate("doctor://{id}/slots", { list: undefined }),
        {
            title: "Horários Disponíveis",
            description: "Lista os horários disponíveis para agendamento de um médico específico",
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
