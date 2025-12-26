import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDoctors, getAvailableSlots, getDoctorById, findDoctor } from "../db/doctors.js";
import { createAppointment, checkSlotAvailability, getSlotByTime } from "../db/appointments.js";
import { TimeSlot } from "../types/index.js";
import { searchDoctorsSchema, getAvailableSlotsSchema, scheduleAppointmentSchema } from "./schemas.js";

export function registerTools(server: McpServer) {
    // Tool 1: search_doctors
    server.registerTool(
        "search_doctors",
        {
            title: "Search Doctors",
            description: "Use this when the user wants to find doctors. Searches by name, specialty, or city. All filters are optional and can be combined. Returns complete doctor information.",
            inputSchema: searchDoctorsSchema,
        },
        async ({ name, specialty, city }) => {
            try {
                const doctors = await listDoctors({ name, specialty, city });

                if (doctors.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: true,
                                count: 0,
                                message: "No doctors found with the given filters.",
                                doctors: []
                            })
                        }]
                    };
                }

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            count: doctors.length,
                            doctors: doctors.map(d => ({
                                id: d.id,
                                name: d.name,
                                specialty: d.specialty,
                                address: d.address,
                                city: d.city,
                                state: d.state,
                                imageUrl: d.image_url,
                                coordinates: d.coordinates
                            }))
                        })
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : "Error searching doctors"
                        })
                    }]
                };
            }
        }
    );

    // Tool 2: get_available_slots
    server.registerTool(
        "get_available_slots",
        {
            title: "View Available Slots",
            description: "Use this when the user wants to see available appointment times. You can pass the doctor's ID (UUID) OR search by name and specialty. If multiple doctors match the name, include the specialty to disambiguate.",
            inputSchema: getAvailableSlotsSchema,
        },
        async ({ doctorId, doctorName, specialty }) => {
            try {
                // Validate: at least one identifier required
                if (!doctorId && !doctorName) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                error: "Please provide the doctor's ID or name."
                            })
                        }]
                    };
                }

                // Find doctor by ID or by name/specialty
                let doctor;

                if (doctorId) {
                    doctor = await getDoctorById(doctorId);
                    if (!doctor) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Doctor not found with ID: ${doctorId}`
                                })
                            }]
                        };
                    }
                } else {
                    // Search by name and optional specialty
                    const result = await findDoctor({ name: doctorName, specialty });

                    if (!result.found) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `No doctor found with name "${doctorName}"${specialty ? ` and specialty "${specialty}"` : ''}.`
                                })
                            }]
                        };
                    }

                    if (result.ambiguous) {
                        // Multiple matches - return list for user to choose
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    ambiguous: true,
                                    message: `Found ${result.matches.length} doctors with name "${doctorName}". Please specify the specialty or choose one:`,
                                    matches: result.matches.map(d => ({
                                        id: d.id,
                                        name: d.name,
                                        specialty: d.specialty,
                                        address: d.address
                                    }))
                                })
                            }]
                        };
                    }

                    doctor = result.doctor;
                }

                // Get available slots
                const slots = await getAvailableSlots(doctor!.id);

                if (slots.length === 0) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: true,
                                doctor: { id: doctor!.id, name: doctor!.name, specialty: doctor!.specialty },
                                count: 0,
                                message: "No available slots for this doctor.",
                                slots: []
                            })
                        }]
                    };
                }

                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            doctor: { id: doctor!.id, name: doctor!.name, specialty: doctor!.specialty },
                            count: slots.length,
                            slots: slots.map((s: TimeSlot) => ({
                                id: s.id,
                                time: s.slot_time
                            }))
                        })
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : "Error fetching available slots"
                        })
                    }]
                };
            }
        }
    );

    // Tool 3: schedule_appointment
    server.registerTool(
        "schedule_appointment",
        {
            title: "Schedule Appointment",
            description: "Use this when the user wants to book an appointment. You can identify the doctor by UUID or by name+specialty. You can identify the time slot by UUID or by time string (e.g., '09:00'). If multiple doctors match, include the specialty.",
            inputSchema: scheduleAppointmentSchema,
        },
        async ({ doctorId, doctorName, specialty, slotId, slotTime, patientName, patientPhone }) => {
            try {
                // 1. Validate doctor identification
                if (!doctorId && !doctorName) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                error: "Please provide the doctor's ID or name."
                            })
                        }]
                    };
                }

                // 2. Find doctor
                let doctor;

                if (doctorId) {
                    doctor = await getDoctorById(doctorId);
                    if (!doctor) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Doctor not found with ID: ${doctorId}`
                                })
                            }]
                        };
                    }
                } else {
                    const result = await findDoctor({ name: doctorName, specialty });

                    if (!result.found) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `No doctor found with name "${doctorName}"${specialty ? ` and specialty "${specialty}"` : ''}.`
                                })
                            }]
                        };
                    }

                    if (result.ambiguous) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: JSON.stringify({
                                    success: false,
                                    ambiguous: true,
                                    message: `Found ${result.matches.length} doctors with name "${doctorName}". Please specify the specialty:`,
                                    matches: result.matches.map(d => ({
                                        id: d.id,
                                        name: d.name,
                                        specialty: d.specialty
                                    }))
                                })
                            }]
                        };
                    }

                    doctor = result.doctor;
                }

                // 3. Validate slot identification
                if (!slotId && !slotTime) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                error: "Please provide the slot ID or desired time (e.g., '09:00')."
                            })
                        }]
                    };
                }

                // 4. Find slot by ID or time
                let slot;
                if (slotId) {
                    slot = await checkSlotAvailability(slotId);
                } else if (slotTime) {
                    slot = await getSlotByTime(doctor!.id, slotTime);
                }

                if (!slot) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                error: slotTime
                                    ? `Time slot ${slotTime} is not available for ${doctor!.name}.`
                                    : "This time slot is no longer available."
                            })
                        }]
                    };
                }

                // 5. Create appointment
                const appointment = await createAppointment({
                    doctorId: doctor!.id,
                    slotId: slot.id,
                    patientName,
                    patientPhone,
                });

                if (!appointment) {
                    return {
                        content: [{
                            type: "text" as const,
                            text: JSON.stringify({
                                success: false,
                                error: "Failed to create appointment. Please try again."
                            })
                        }]
                    };
                }

                // 6. Return success with confirmation details
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: true,
                            message: "Appointment scheduled successfully!",
                            appointment: {
                                id: appointment.id,
                                doctor: doctor!.name,
                                specialty: doctor!.specialty,
                                address: `${doctor!.address}, ${doctor!.city} - ${doctor!.state}`,
                                scheduledAt: slot.slot_time,
                                patient: patientName,
                                phone: patientPhone
                            }
                        })
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text" as const,
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : "Error scheduling appointment"
                        })
                    }]
                };
            }
        }
    );
}
