import { supabase } from './client.js';
import type { Appointment, TimeSlot, CreateAppointmentInput } from '../types/index.js';

export async function checkSlotAvailability(slotId: string): Promise<TimeSlot | null> {
    const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('id', slotId)
        .eq('is_available', true)
        .single();

    if (error) {
        console.error(`Error checking slot ${slotId}:`, error);
        return null;
    }

    return data as TimeSlot;
}

export async function getSlotByTime(doctorId: string, timeQuery: string): Promise<TimeSlot | null> {
    const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_available', true);

    if (error || !data) {
        console.error(`Error fetching slots for doctor ${doctorId}:`, error);
        return null;
    }

    const normalizedQuery = timeQuery.toLowerCase().replace('h', ':00');

    const match = data.find(slot => {
        const slotTime = slot.slot_time.toLowerCase();
        return slotTime.includes(normalizedQuery) ||
            slotTime.includes(timeQuery);
    });

    return match as TimeSlot || null;
}

export async function markSlotAsBooked(slotId: string): Promise<boolean> {
    const { error } = await supabase
        .from('time_slots')
        .update({ is_available: false })
        .eq('id', slotId);

    if (error) {
        console.error(`Error marking slot ${slotId} as booked:`, error);
        return false;
    }

    return true;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment | null> {
    const slot = await checkSlotAvailability(input.slotId);
    if (!slot) {
        console.error(`Slot ${input.slotId} is not available or does not exist`);
        return null;
    }

    const booked = await markSlotAsBooked(input.slotId);
    if (!booked) {
        console.error(`Failed to mark slot ${input.slotId} as booked`);
        return null;
    }

    const { data, error } = await supabase
        .from('appointments')
        .insert({
            doctor_id: input.doctorId,
            patient_name: input.patientName,
            patient_phone: input.patientPhone,
            scheduled_at: slot.slot_time
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating appointment:', error);
        return null;
    }

    return data as Appointment;
}
