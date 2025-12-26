export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    address: string;
    city: string;
    state: string;
    image_url?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    available_slots?: string[];
}

export interface TimeSlot {
    id: string;
    doctor_id: string;
    slot_time: string;
    is_available: boolean;
}

export interface Appointment {
    id: string;
    doctor_id: string;
    patient_name: string;
    scheduled_at: string;
}

export interface DoctorFilters {
    name?: string;
    specialty?: string;
    city?: string;
    state?: string;
}

export interface FindDoctorResult {
    found: boolean;
    ambiguous: boolean;
    doctor?: Doctor;
    matches: Doctor[];
}

export interface CreateAppointmentInput {
    doctorId: string;
    patientName: string;
    patientPhone: string;
    slotId: string;
}
