import { z } from "zod";

// Tool: search_doctors
export const searchDoctorsSchema = {
    name: z
        .string()
        .optional()
        .describe("Doctor's name or part of it (e.g., 'Silva', 'Dr. Luis')"),
    specialty: z
        .string()
        .optional()
        .describe("Medical specialty (e.g., 'Cardiologista', 'Pediatra', 'Dermatologista')"),
    city: z
        .string()
        .optional()
        .describe("City name (e.g., 'São Paulo', 'Rio de Janeiro')"),
};

// Tool: get_available_slots
export const getAvailableSlotsSchema = {
    doctorId: z
        .string()
        .uuid()
        .optional()
        .describe("The doctor's UUID (if you have it from search_doctors)"),
    doctorName: z
        .string()
        .optional()
        .describe("The doctor's name or part of it (e.g., 'Silva', 'Dr. Luis')"),
    specialty: z
        .string()
        .optional()
        .describe("Medical specialty to disambiguate when multiple doctors have similar names"),
};

// Tool: schedule_appointment
export const scheduleAppointmentSchema = {
    // Doctor identification (one required)
    doctorId: z
        .string()
        .uuid()
        .optional()
        .describe("The doctor's UUID"),
    doctorName: z
        .string()
        .optional()
        .describe("The doctor's name (e.g., 'Silva', 'Dr. Luis')"),
    specialty: z
        .string()
        .optional()
        .describe("Medical specialty to disambiguate when multiple doctors have similar names"),
    // Slot identification (one required)
    slotId: z
        .string()
        .uuid()
        .optional()
        .describe("The time slot's UUID (from get_available_slots)"),
    slotTime: z
        .string()
        .optional()
        .describe("The desired time (e.g., '09:00', '9h', '14:00'). Will find matching available slot."),
    // Patient info (required)
    patientName: z
        .string()
        .min(2)
        .describe("Patient's full name"),
    patientPhone: z
        .string()
        .min(8)
        .describe("Patient's phone number for contact"),
};
