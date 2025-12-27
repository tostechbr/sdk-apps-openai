-- =====================================================
-- Seed Data: Doctors and Time Slots
-- =====================================================
-- Run after schema.sql to populate with mock data
-- =====================================================

-- Insert mock doctors
insert into doctors (name, specialty, address, city, state, image_url, coordinates, available_slots)
values
  ('Dr. Silva', 'Cardiologista', 'Av. Paulista, 1000', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop', '{"lat": -23.561684, "lng": -46.655981}', '[]'),
  ('Dra. Santos', 'Pediatra', 'Rua Augusta, 500', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', '{"lat": -23.553251, "lng": -46.657235}', '[]'),
  ('Dr. Oliveira', 'Dermatologista', 'Rua Oscar Freire, 800', 'São Paulo', 'SP', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop', '{"lat": -23.566487, "lng": -46.667232}', '[]');

-- Insert time slots for Dr. Silva (Cardiologista)
insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    ('2025-01-06T09:00:00-03:00'::timestamptz),
    ('2025-01-06T10:00:00-03:00'::timestamptz),
    ('2025-01-06T14:00:00-03:00'::timestamptz),
    ('2025-01-07T09:00:00-03:00'::timestamptz),
    ('2025-01-07T11:00:00-03:00'::timestamptz)
) as slots(slot_time)
where d.name = 'Dr. Silva';

-- Insert time slots for Dra. Santos (Pediatra)
insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    ('2025-01-06T11:00:00-03:00'::timestamptz),
    ('2025-01-06T15:00:00-03:00'::timestamptz),
    ('2025-01-07T10:00:00-03:00'::timestamptz),
    ('2025-01-07T14:00:00-03:00'::timestamptz)
) as slots(slot_time)
where d.name = 'Dra. Santos';

-- Insert time slots for Dr. Oliveira (Dermatologista)
insert into time_slots (doctor_id, slot_time, is_available)
select d.id, slot_time, true
from doctors d
cross join (
  values
    ('2025-01-06T09:00:00-03:00'::timestamptz),
    ('2025-01-06T16:00:00-03:00'::timestamptz),
    ('2025-01-08T09:00:00-03:00'::timestamptz),
    ('2025-01-08T13:00:00-03:00'::timestamptz)
) as slots(slot_time)
where d.name = 'Dr. Oliveira';
