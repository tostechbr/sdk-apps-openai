-- Create doctors table
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  location text not null,
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

-- Insert mock data
insert into doctors (name, specialty, location, image_url, coordinates, available_slots)
values
  ('Dr. Silva', 'Cardiologista', 'Av. Paulista, 1000 - São Paulo, SP', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop', '{"lat": -23.561684, "lng": -46.655981}', '["2023-12-26T09:00:00Z", "2023-12-26T10:00:00Z", "2023-12-26T14:00:00Z"]'),
  ('Dra. Santos', 'Pediatra', 'Rua Augusta, 500 - São Paulo, SP', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop', '{"lat": -23.553251, "lng": -46.657235}', '["2023-12-26T11:00:00Z", "2023-12-26T15:00:00Z"]'),
  ('Dr. Oliveira', 'Dermatologista', 'Rua Oscar Freire, 800 - São Paulo, SP', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop', '{"lat": -23.566487, "lng": -46.667232}', '["2023-12-27T09:00:00Z", "2023-12-27T16:00:00Z"]');
