import { supabase } from './client.js';
import type { Doctor, TimeSlot, DoctorFilters, FindDoctorResult } from '../types/index.js';

export async function listDoctors(filters: DoctorFilters = {}): Promise<Doctor[]> {
    let query = supabase.from('doctors').select('*');

    if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
    }

    if (filters.specialty) {
        query = query.ilike('specialty', `%${filters.specialty}%`);
    }

    if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
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

export async function getDoctorByName(name: string): Promise<Doctor | null> {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single();

    if (error) {
        console.error(`Error fetching doctor by name "${name}":`, error);
        return null;
    }

    return data as Doctor;
}

export async function findDoctor(filters: { name?: string; specialty?: string }): Promise<FindDoctorResult> {
    const doctors = await listDoctors({
        name: filters.name,
        specialty: filters.specialty
    });

    if (doctors.length === 0) {
        return { found: false, ambiguous: false, matches: [] };
    }

    if (doctors.length === 1) {
        return { found: true, ambiguous: false, doctor: doctors[0], matches: doctors };
    }

    // Multiple matches - ambiguous
    return { found: true, ambiguous: true, matches: doctors };
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
