# 04. MCP Resources Reference

This document describes the **MCP Resources** exposed by the Medical Appointment Server.

Resources expose read-only data that AI agents can access.

---

## Overview

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| List Doctors | `doctor://list` | Returns all registered doctors |
| Available Slots | `doctor://{id}/slots` | Returns available slots for a specific doctor |

---

## 1. List Doctors

**URI:** `doctor://list`

**Title:** List of Doctors

**Description:** Returns all doctors registered in the system.

### Response Example

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. João Silva",
    "specialty": "Cardiologist",
    "address": "Av. Paulista, 1000",
    "city": "São Paulo",
    "state": "SP",
    "image_url": "https://example.com/photo.jpg",
    "coordinates": { "lat": -23.5505, "lng": -46.6333 }
  }
]
```

---

## 2. Available Slots (Resource Template)

**URI Template:** `doctor://{id}/slots`

**Title:** Available Slots

**Description:** Lists available appointment slots for a specific doctor.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Doctor's unique identifier |

### Example URI

```
doctor://550e8400-e29b-41d4-a716-446655440000/slots
```

### Response Example

```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "count": 3,
  "slots": [
    { "id": "slot-uuid-1", "time": "2025-01-10T09:00:00Z", "available": true },
    { "id": "slot-uuid-2", "time": "2025-01-10T10:00:00Z", "available": true },
    { "id": "slot-uuid-3", "time": "2025-01-10T11:00:00Z", "available": true }
  ]
}
```

---

## Usage Notes

- Resources are **read-only** - use Tools for actions like booking
- Resources use custom `doctor://` URI scheme
- Resource Templates (like `{id}`) enable dynamic data access
