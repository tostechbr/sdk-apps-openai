-- =====================================================
-- Medical Appointment Database Schema
-- =====================================================
-- This file contains only DDL statements (CREATE, INDEX).
-- For seed data, see: seeds/doctors.sql
-- =====================================================

-- Create doctors table
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  address text not null,
  city text,
  state text,
  image_url text, -- URL to the doctor's photo
  coordinates jsonb, -- { lat: number, lng: number }
  available_slots jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) not null,
  patient_name text not null,
  patient_phone text not null, -- Contact number for the patient
  scheduled_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_slots table (scalable approach for managing availability)
create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) on delete cascade not null,
  slot_time timestamp with time zone not null,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Prevent duplicate slots for the same doctor at the same time
  unique(doctor_id, slot_time)
);

-- Index for fast queries on available slots
create index if not exists idx_time_slots_doctor_available
  on time_slots(doctor_id, is_available)
  where is_available = true;
