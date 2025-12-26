# 01. Database Setup (Supabase)

This project uses **Supabase** (PostgreSQL) to store doctors and appointments.
We chose Supabase for its ease of use, Realtime support, and native vector integration (future-proofing).

## Data Structure

The database handles two main tables:

### 1. Doctors (`doctors`)
Stores healthcare professional information.


| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Identifier (Primary Key) |
| `name` | Text | Doctor's name |
| `specialty` | Text | Medical specialty (e.g., Cardiologist) |
| `address` | Text | Street address (e.g. "Av. Paulista, 1000") |
| `city` | Text | City Name (e.g. "São Paulo") |
| `state` | Text | State Code (e.g. "SP") |
| `image_url` | Text | Doctor's photo URL |
| `coordinates` | JSONB | Latitude and Longitude `{"lat": ..., "lng": ...}` |
| `available_slots` | JSONB | **[Legacy]** Array of available slots. Use `time_slots` table instead. |

### 2. Time Slots (`time_slots`)
Scalable table for managing doctor availability.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Identifier |
| `doctor_id` | UUID | Reference to doctor (FK) |
| `slot_time` | Timestamptz | Available slot time (ISO 8601) |
| `is_available` | Boolean | Availability status (Default: true) |

### 3. Appointments (`appointments`)

Records scheduled appointments.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Identifier |
| `doctor_id` | UUID | Reference to doctor (FK) |
| `patient_name` | Text | Patient's name |
| `patient_phone` | Text | Patient's contact number |
| `scheduled_at` | Timestamptz | Appointment date and time |

## How to Reproduce

If you are cloning this project, you can set up your database by running the SQL script located at `src/schema.sql`.

### Steps:
1. Create a project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**.
3. Paste the content of `src/schema.sql` and execute.

This will create the tables and insert mock data for testing.
