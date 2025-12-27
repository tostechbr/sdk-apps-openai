# 03. MCP Tools Reference

This document describes the **MCP Tools** exposed by the Medical Appointment Server.

Tools allow ChatGPT to perform actions on behalf of users and render interactive widgets.

---

## Overview

| Tool | Purpose | Widget View |
|------|---------|-------------|
| `search_doctors` | Find doctors by name, specialty, or city | `doctors-list` |
| `get_available_slots` | View available appointment times for a doctor | `slots-list` |
| `schedule_appointment` | Book an appointment with a doctor | `confirmation` |

---

## Tool Response Structure

All tools return responses with this structure:

```typescript
{
    content: [...],           // Text for the model to narrate
    structuredContent: {...}, // JSON visible to model + widget
    _meta: {...},             // Widget-only data (hidden from model)
}
```

**Important:** `_meta` must be at the **same level** as `structuredContent`, not inside it.

The widget reads:
- `structuredContent` → `window.openai.toolOutput`
- `_meta` → `window.openai.toolResponseMetadata`

---

## Tool Metadata

All tools include OpenAI-specific metadata:

```typescript
_meta: {
    "openai/outputTemplate": "ui://widget/medical-app.html",
    "openai/toolInvocation/invoking": "Searching for doctors...",
    "openai/toolInvocation/invoked": "Found doctors",
    "openai/widgetAccessible": true,
}
```

| Key | Purpose |
|-----|---------|
| `openai/outputTemplate` | Widget resource URI to render |
| `openai/toolInvocation/invoking` | Status text while tool runs |
| `openai/toolInvocation/invoked` | Status text after tool completes |
| `openai/widgetAccessible` | Allow widget to call this tool |

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

**structuredContent** (visible to model):
```json
{
  "success": true,
  "count": 2,
  "doctors": [
    {
      "name": "Dr. João Silva",
      "specialty": "Cardiologist",
      "city": "São Paulo",
      "state": "SP"
    }
  ]
}
```

**_meta** (widget only):
```json
{
  "view": "doctors-list",
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

**structuredContent** (visible to model):
```json
{
  "success": true,
  "doctor": { "name": "Dr. Silva", "specialty": "Cardiologist" },
  "count": 3,
  "slots": [
    { "time": "seg, 10 jan, 09:00" },
    { "time": "seg, 10 jan, 10:00" }
  ]
}
```

**_meta** (widget only):
```json
{
  "view": "slots-list",
  "doctor": {
    "id": "uuid",
    "name": "Dr. Silva",
    "specialty": "Cardiologist",
    "address": "Av. Paulista, 1000",
    "imageUrl": "https://..."
  },
  "slots": [
    {
      "id": "slot-uuid",
      "time": "2025-01-10T09:00:00Z",
      "formattedTime": "segunda-feira, 10 de janeiro de 2025 09:00"
    }
  ]
}
```

### Disambiguation Response

When multiple doctors match the name:

```json
{
  "success": false,
  "ambiguous": true,
  "matches": [
    { "id": "uuid", "name": "Dr. Ana Silva", "specialty": "Dermatologist" },
    { "id": "uuid", "name": "Dr. João Silva", "specialty": "Cardiologist" }
  ]
}
```

**_meta:**
```json
{
  "view": "disambiguation",
  "matches": [...]
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

**structuredContent** (visible to model):
```json
{
  "success": true,
  "appointment": {
    "doctorName": "Dr. João Silva",
    "specialty": "Cardiologist",
    "scheduledAt": "segunda-feira, 10 de janeiro de 2025 09:00",
    "patientName": "Maria Santos"
  }
}
```

**_meta** (widget only):
```json
{
  "view": "confirmation",
  "appointment": {
    "id": "appointment-uuid",
    "doctor": {
      "id": "uuid",
      "name": "Dr. João Silva",
      "specialty": "Cardiologist",
      "address": "Av. Paulista, 1000",
      "imageUrl": "https://..."
    },
    "scheduledAt": "2025-01-10T09:00:00Z",
    "formattedDate": "segunda-feira, 10 de janeiro de 2025 09:00",
    "patient": {
      "name": "Maria Santos",
      "phone": "11999998888"
    }
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

The widget does not render a special view for errors; the model narrates the error to the user.
