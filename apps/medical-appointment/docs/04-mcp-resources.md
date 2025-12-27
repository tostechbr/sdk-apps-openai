# 04. MCP Resources Reference

This document describes the **MCP Resources** exposed by the Medical Appointment Server.

Resources expose read-only data and UI templates for ChatGPT.

---

## Overview

| Resource | URI Pattern | Type | Description |
|----------|-------------|------|-------------|
| List Doctors | `doctor://list` | Data | Returns all registered doctors |
| Available Slots | `doctor://{id}/slots` | Data | Returns available slots for a doctor |
| Medical Widget | `ui://widget/medical-app.html` | UI | Interactive widget for ChatGPT |

---

## 1. List Doctors

**URI:** `doctor://list`

**Title:** List of Doctors

**Description:** Returns all doctors registered in the system.

**MIME Type:** `application/json`

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

**MIME Type:** `application/json`

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

## 3. Medical Widget (UI Template)

**URI:** `ui://widget/medical-app.html`

**Title:** Medical Appointment Widget

**Description:** Interactive widget for searching doctors and scheduling appointments. Renders inside ChatGPT's iframe.

**MIME Type:** `text/html+skybridge`

### Widget Metadata

The widget resource includes special metadata for ChatGPT:

```typescript
_meta: {
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": {
        connect_domains: ["https://*.supabase.co"],
        resource_domains: ["https://*.supabase.co", "https://images.unsplash.com"],
    },
}
```

| Key | Purpose |
|-----|---------|
| `openai/widgetPrefersBorder` | Render widget with border in ChatGPT |
| `openai/widgetCSP.connect_domains` | Allowed domains for API calls |
| `openai/widgetCSP.resource_domains` | Allowed domains for images/assets |

### Widget Views

The widget renders different views based on `_meta.view`:

| View | Description | Trigger |
|------|-------------|---------|
| `doctors-list` | Grid of doctor cards | `search_doctors` success |
| `slots-list` | Doctor info + time slot buttons | `get_available_slots` success |
| `confirmation` | Booking confirmation | `schedule_appointment` success |
| `disambiguation` | Multiple doctor options | Ambiguous doctor match |
| `default` | Empty state | No data |

### Widget API Usage

The widget uses `window.openai` to interact with ChatGPT:

```javascript
// Read tool response data
const toolOutput = window.openai.toolOutput;           // structuredContent
const meta = window.openai.toolResponseMetadata;       // _meta

// Call another tool
window.openai.callTool("get_available_slots", { doctorId: "uuid" });

// Send follow-up message
window.openai.sendFollowUpMessage({ prompt: "Show doctors again" });
```

---

## Usage Notes

- Data resources are **read-only** - use Tools for actions like booking
- Resources use custom URI schemes (`doctor://`, `ui://`)
- The widget resource must have MIME type `text/html+skybridge` to enable `window.openai`
- CSP configuration is required for external API calls and images
