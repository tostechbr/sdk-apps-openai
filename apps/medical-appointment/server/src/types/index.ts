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
    available_slots?: string[]; // Legacy (kept for backward compat, but we prefer time_slots table)
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
