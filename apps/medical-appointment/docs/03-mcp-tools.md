# 03. MCP Tools Reference

This document describes the **MCP Tools** exposed by the Medical Appointment Server.

Tools allow AI agents to perform actions on behalf of users.

---

## Overview

| Tool | Purpose |
|------|---------|
| `search_doctors` | Find doctors by name, specialty, or city |
| `get_available_slots` | View available appointment times for a doctor |
| `schedule_appointment` | Book an appointment with a doctor |

---

## 1. search_doctors

**Title:** Search Doctors

**Description:** Searches for doctors by name, specialty, or city. All filters are optional and can be combined.

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Doctor's name or part of it (e.g., "Silva") |
| `specialty` | string | No | Medical specialty (e.g., "Cardiologist") |
| `city` | string | No | City name (e.g., "São Paulo") |

### Response Example

```json
{
  "success": true,
  "count": 2,
  "doctors": [
    {
      "id": "uuid-here",
      "name": "Dr. João Silva",
      "specialty": "Cardiologist",
      "address": "Av. Paulista, 1000",
      "city": "São Paulo",
      "state": "SP",
      "imageUrl": "https://...",
      "coordinates": { "lat": -23.5, "lng": -46.6 }
    }
  ]
}
```

---

## 2. get_available_slots

**Title:** View Available Slots

**Description:** Returns available appointment times for a specific doctor. Can identify doctor by UUID or name.

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctorId` | UUID | No* | Doctor's UUID (from search_doctors) |
| `doctorName` | string | No* | Doctor's name to search |
| `specialty` | string | No | Specialty to disambiguate multiple matches |

*At least one of `doctorId` or `doctorName` is required.

### Response Example

```json
{
  "success": true,
  "doctor": { "id": "uuid", "name": "Dr. Silva", "specialty": "Cardiologist" },
  "count": 3,
  "slots": [
    { "id": "slot-uuid", "time": "2025-01-10T09:00:00Z" },
    { "id": "slot-uuid", "time": "2025-01-10T10:00:00Z" }
  ]
}
```

---

## 3. schedule_appointment

**Title:** Schedule Appointment

**Description:** Books an appointment with a doctor. Can identify doctor and slot by UUID or by name/time.

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `doctorId` | UUID | No* | Doctor's UUID |
| `doctorName` | string | No* | Doctor's name |
| `specialty` | string | No | Specialty to disambiguate |
| `slotId` | UUID | No** | Time slot's UUID |
| `slotTime` | string | No** | Desired time (e.g., "09:00") |
| `patientName` | string | Yes | Patient's full name |
| `patientPhone` | string | Yes | Patient's phone number |

*At least one of `doctorId` or `doctorName` required.  
**At least one of `slotId` or `slotTime` required.

### Response Example

```json
{
  "success": true,
  "message": "Appointment scheduled successfully!",
  "appointment": {
    "id": "appointment-uuid",
    "doctor": "Dr. João Silva",
    "specialty": "Cardiologist",
    "address": "Av. Paulista, 1000, São Paulo - SP",
    "scheduledAt": "2025-01-10T09:00:00Z",
    "patient": "Maria Santos",
    "phone": "11999998888"
  }
}
```

---

## Error Handling

All tools return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

For ambiguous doctor matches, the response includes options:

```json
{
  "success": false,
  "ambiguous": true,
  "message": "Found 2 doctors with name 'Silva'. Please specify the specialty:",
  "matches": [
    { "id": "uuid", "name": "Dr. Ana Silva", "specialty": "Dermatologist" },
    { "id": "uuid", "name": "Dr. João Silva", "specialty": "Cardiologist" }
  ]
}
```
