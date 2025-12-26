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

-- Insert mock doctors
insert into doctors (name, specialty, address, city, state, image_url, coordinates, available_slots)
values
  ('Dr. Silva', 'Cardiologista', 'Av. Paulista, 1000', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop', '{"lat": -23.561684, "lng": -46.655981}', '[]'),
  ('Dra. Santos', 'Pediatra', 'Rua Augusta, 500', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', '{"lat": -23.553251, "lng": -46.657235}', '[]'),
  ('Dr. Oliveira', 'Dermatologista', 'Rua Oscar Freire, 800', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop', '{"lat": -23.566487, "lng": -46.667232}', '[]');

-- Insert mock time_slots (using doctor IDs from above)
-- All times are in Brazil Time (UTC-3)
insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    -- Dr. Silva (Cardiologista)
    ('2025-01-06T09:00:00-03:00'::timestamptz),
    ('2025-01-06T10:00:00-03:00'::timestamptz),
    ('2025-01-06T14:00:00-03:00'::timestamptz),
    ('2025-01-07T09:00:00-03:00'::timestamptz),
    ('2025-01-07T11:00:00-03:00'::timestamptz)
) as slots(slot_time)
where d.name = 'Dr. Silva';

insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    -- Dra. Santos (Pediatra)
    ('2025-01-06T11:00:00-03:00'::timestamptz),
    ('2025-01-06T15:00:00-03:00'::timestamptz),
    ('2025-01-07T10:00:00-03:00'::timestamptz),
    ('2025-01-07T14:00:00-03:00'::timestamptz)
) as slots(slot_time)
where d.name = 'Dra. Santos';

insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    -- Dr. Oliveira (Dermatologista)
    ('2025-01-06T09:00:00-03:00'::timestamptz),
    ('2025-01-06T16:00:00-03:00'::timestamptz),
    ('2025-01-08T09:00:00-03:00'::timestamptz),
    ('2025-01-08T13:00:00-03:00'::timestamptz) -- Was 14h, let's keep consistent but fixed to UTC-3
) as slots(slot_time)
where d.name = 'Dr. Oliveira';
