import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots, getDoctorById, findDoctor } from "../db/doctors.js";
import { createAppointment, checkSlotAvailability, getSlotByTime } from "../db/appointments.js";
import { TimeSlot } from "../types/index.js";
import { searchDoctorsSchema, getAvailableSlotsSchema, scheduleAppointmentSchema } from "./schemas.js";

const WIDGET_TEMPLATE = "ui://widget/medical-app.html";

export function registerTools(server: McpServer) {
    // Tool 1: search_doctors
    server.registerTool(
        "search_doctors",
        {
            title: "Search Doctors",
            description: "Use this when the user wants to find doctors. Searches by name, specialty, or city. All filters are optional and can be combined.",
            inputSchema: searchDoctorsSchema,
            _meta: {
                "openai/outputTemplate": WIDGET_TEMPLATE,
                "openai/toolInvocation/invoking": "Searching for doctors...",
                "openai/toolInvocation/invoked": "Found doctors",
                "openai/widgetAccessible": true,
            },
        },
        async ({ name, specialty, city }) => {
            try {
                const doctors = await listDoctors({ name, specialty, city });

                if (doctors.length === 0) {
                    return {
                        content: [{ type: "text" as const, text: "No doctors found with the given filters." }],
                        structuredContent: { success: true, count: 0, doctors: [] },
                    };
                }

                const doctorsSummary = doctors.map(d => ({
                    name: d.name,
                    specialty: d.specialty,
                    city: d.city,
                    state: d.state,
                }));

                const doctorsRich = doctors.map(d => ({
                    id: d.id,
                    name: d.name,
                    specialty: d.specialty,
                    address: d.address,
                    city: d.city,
                    state: d.state,
                    imageUrl: d.image_url,
                    coordinates: d.coordinates,
                }));

                const filterDesc = [name, specialty, city].filter(Boolean).join(", ") || "all";

                return {
                    content: [{ type: "text" as const, text: `Found ${doctors.length} doctor(s) matching: ${filterDesc}.` }],
                    structuredContent: {
                        success: true,
                        count: doctors.length,
                        doctors: doctorsSummary,
                        // Widget data - goes to window.openai.toolOutput
                        _meta: {
                            view: "doctors-list",
                            doctors: doctorsRich,
                        },
                    },
                };
            } catch (error) {
                return {
                    content: [{ type: "text" as const, text: `Error searching doctors: ${error instanceof Error ? error.message : "Unknown error"}` }],
                    structuredContent: { success: false, error: error instanceof Error ? error.message : "Error searching doctors" },
                };
            }
        }
    );

    // Tool 2: get_available_slots
    server.registerTool(
        "get_available_slots",
        {
            title: "View Available Slots",
            description: "Use this when the user wants to see available appointment times for a doctor. Pass doctor ID or name (with optional specialty to disambiguate).",
            inputSchema: getAvailableSlotsSchema,
            _meta: {
                "openai/outputTemplate": WIDGET_TEMPLATE,
                "openai/toolInvocation/invoking": "Checking availability...",
                "openai/toolInvocation/invoked": "Availability loaded",
                "openai/widgetAccessible": true,
            },
        },
        async ({ doctorId, doctorName, specialty }) => {
            try {
                if (!doctorId && !doctorName) {
                    return {
                        content: [{ type: "text" as const, text: "Please provide the doctor's ID or name." }],
                        structuredContent: { success: false, error: "Missing doctor identifier" },
                    };
                }

                let doctor;

                if (doctorId) {
                    doctor = await getDoctorById(doctorId);
                    if (!doctor) {
                        return {
                            content: [{ type: "text" as const, text: `Doctor not found with ID: ${doctorId}` }],
                            structuredContent: { success: false, error: "Doctor not found" },
                        };
                    }
                } else {
                    const result = await findDoctor({ name: doctorName, specialty });

                    if (!result.found) {
                        return {
                            content: [{ type: "text" as const, text: `No doctor found with name "${doctorName}"${specialty ? ` (${specialty})` : ""}.` }],
                            structuredContent: { success: false, error: "Doctor not found" },
                        };
                    }

                    if (result.ambiguous) {
                        const matches = result.matches.map(d => ({
                            id: d.id,
                            name: d.name,
                            specialty: d.specialty,
                        }));

                        return {
                            content: [{ type: "text" as const, text: `Found ${result.matches.length} doctors named "${doctorName}". Please specify which one.` }],
                            structuredContent: {
                                success: false,
                                ambiguous: true,
                                matches,
                                _meta: {
                                    view: "disambiguation",
                                    matches: result.matches.map(d => ({
                                        id: d.id,
                                        name: d.name,
                                        specialty: d.specialty,
                                        address: d.address,
                                    })),
                                },
                            },
                        };
                    }

                    doctor = result.doctor;
                }

                const slots = await getAvailableSlots(doctor!.id);

                if (slots.length === 0) {
                    return {
                        content: [{ type: "text" as const, text: `${doctor!.name} has no available slots at the moment.` }],
                        structuredContent: {
                            success: true,
                            doctor: { id: doctor!.id, name: doctor!.name, specialty: doctor!.specialty },
                            count: 0,
                            slots: [],
                        },
                    };
                }

                const slotsSummary = slots.map((s: TimeSlot) => {
                    const date = new Date(s.slot_time);
                    return {
                        time: date.toLocaleString("pt-BR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    };
                });

                return {
                    content: [{ type: "text" as const, text: `${doctor!.name} (${doctor!.specialty}) has ${slots.length} available slot(s).` }],
                    structuredContent: {
                        success: true,
                        doctor: { name: doctor!.name, specialty: doctor!.specialty },
                        count: slots.length,
                        slots: slotsSummary,
                        // Widget data - goes to window.openai.toolOutput
                        _meta: {
                            view: "slots-list",
                            doctor: {
                                id: doctor!.id,
                                name: doctor!.name,
                                specialty: doctor!.specialty,
                                address: doctor!.address,
                                city: doctor!.city,
                                state: doctor!.state,
                                imageUrl: doctor!.image_url,
                            },
                            slots: slots.map((s: TimeSlot) => ({
                                id: s.id,
                                time: s.slot_time,
                                formattedTime: new Date(s.slot_time).toLocaleString("pt-BR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }),
                            })),
                        },
                    },
                };
            } catch (error) {
                return {
                    content: [{ type: "text" as const, text: `Error fetching slots: ${error instanceof Error ? error.message : "Unknown error"}` }],
                    structuredContent: { success: false, error: error instanceof Error ? error.message : "Error fetching slots" },
                };
            }
        }
    );

    // Tool 3: schedule_appointment
    server.registerTool(
        "schedule_appointment",
        {
            title: "Schedule Appointment",
            description: "Use this to book an appointment. Identify doctor by ID or name+specialty, and slot by ID or time (e.g., '09:00'). Requires patient name and phone.",
            inputSchema: scheduleAppointmentSchema,
            _meta: {
                "openai/outputTemplate": WIDGET_TEMPLATE,
                "openai/toolInvocation/invoking": "Scheduling appointment...",
                "openai/toolInvocation/invoked": "Appointment scheduled",
                "openai/widgetAccessible": true,
            },
        },
        async ({ doctorId, doctorName, specialty, slotId, slotTime, patientName, patientPhone }) => {
            try {
                if (!doctorId && !doctorName) {
                    return {
                        content: [{ type: "text" as const, text: "Please provide the doctor's ID or name." }],
                        structuredContent: { success: false, error: "Missing doctor identifier" },
                    };
                }

                let doctor;

                if (doctorId) {
                    doctor = await getDoctorById(doctorId);
                    if (!doctor) {
                        return {
                            content: [{ type: "text" as const, text: `Doctor not found with ID: ${doctorId}` }],
                            structuredContent: { success: false, error: "Doctor not found" },
                        };
                    }
                } else {
                    const result = await findDoctor({ name: doctorName, specialty });

                    if (!result.found) {
                        return {
                            content: [{ type: "text" as const, text: `No doctor found with name "${doctorName}"${specialty ? ` (${specialty})` : ""}.` }],
                            structuredContent: { success: false, error: "Doctor not found" },
                        };
                    }

                    if (result.ambiguous) {
                        const matches = result.matches.map(d => ({
                            id: d.id,
                            name: d.name,
                            specialty: d.specialty,
                        }));

                        return {
                            content: [{ type: "text" as const, text: `Found ${result.matches.length} doctors named "${doctorName}". Please specify which one.` }],
                            structuredContent: { success: false, ambiguous: true, matches },
                        };
                    }

                    doctor = result.doctor;
                }

                if (!slotId && !slotTime) {
                    return {
                        content: [{ type: "text" as const, text: "Please provide the slot ID or desired time." }],
                        structuredContent: { success: false, error: "Missing slot identifier" },
                    };
                }

                let slot;
                if (slotId) {
                    slot = await checkSlotAvailability(slotId);
                } else if (slotTime) {
                    slot = await getSlotByTime(doctor!.id, slotTime);
                }

                if (!slot) {
                    return {
                        content: [{ type: "text" as const, text: slotTime ? `Time ${slotTime} is not available for ${doctor!.name}.` : "This slot is no longer available." }],
                        structuredContent: { success: false, error: "Slot not available" },
                    };
                }

                const appointment = await createAppointment({
                    doctorId: doctor!.id,
                    slotId: slot.id,
                    patientName,
                    patientPhone,
                });

                if (!appointment) {
                    return {
                        content: [{ type: "text" as const, text: "Failed to create appointment. Please try again." }],
                        structuredContent: { success: false, error: "Failed to create appointment" },
                    };
                }

                const formattedDate = new Date(slot.slot_time).toLocaleString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                return {
                    content: [{ type: "text" as const, text: `Appointment confirmed with ${doctor!.name} (${doctor!.specialty}) on ${formattedDate}.` }],
                    structuredContent: {
                        success: true,
                        appointment: {
                            doctorName: doctor!.name,
                            specialty: doctor!.specialty,
                            scheduledAt: formattedDate,
                            patientName,
                        },
                        // Widget data - goes to window.openai.toolOutput
                        _meta: {
                            view: "confirmation",
                            appointment: {
                                id: appointment.id,
                                doctor: {
                                    id: doctor!.id,
                                    name: doctor!.name,
                                    specialty: doctor!.specialty,
                                    address: doctor!.address,
                                    city: doctor!.city,
                                    state: doctor!.state,
                                    imageUrl: doctor!.image_url,
                                },
                                scheduledAt: slot.slot_time,
                                formattedDate,
                                patient: {
                                    name: patientName,
                                    phone: patientPhone,
                                },
                            },
                        },
                    },
                };
            } catch (error) {
                return {
                    content: [{ type: "text" as const, text: `Error scheduling: ${error instanceof Error ? error.message : "Unknown error"}` }],
                    structuredContent: { success: false, error: error instanceof Error ? error.message : "Error scheduling" },
                };
            }
        }
    );
}
