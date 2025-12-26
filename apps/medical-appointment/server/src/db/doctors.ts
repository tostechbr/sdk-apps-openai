import { supabase } from './client.js';
import type { Doctor, TimeSlot } from '../types/index.js';

export interface DoctorFilters {
    specialty?: string;
    city?: string;
    state?: string;
}

export async function listDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
    let query = supabase.from('doctors').select('*');

    if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
    }

    if (filters.city) {
        query = query.ilike('city', filters.city);
    }

    if (filters.state) {
        query = query.eq('state', filters.state.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching doctors:', error);
        throw new Error(`Failed to fetch doctors: ${error.message}`);
    }

    return data as Doctor[];
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching doctor ${id}:`, error);
        return null;
    }

    return data as Doctor;
}
export async function getAvailableSlots(doctorId: string): Promise<TimeSlot[]> {
    const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true)
        .order('slot_time', { ascending: true });

    if (error) {
        console.error(`Error fetching slots for doctor ${doctorId}:`, error);
        return [];
    }

    return data as TimeSlot[];
}
