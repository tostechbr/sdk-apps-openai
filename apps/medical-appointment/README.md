<div align="center">

# Medical Appointment

[![Module](https://img.shields.io/badge/Module-Medical_Appointment-blue.svg)](./)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![Transport](https://img.shields.io/badge/Transport-HTTP-orange)](./)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen)](./)

**An intelligent medical appointment scheduling system with doctor search, availability checking, and booking capabilities. Integrates with ChatGPT via OpenAI Apps SDK.**

[Features](#features) • [Tools](#tools-definition) • [Setup](#setup--execution) • [ChatGPT Integration](#chatgpt-integration)

</div>

---

## Overview

The Medical Appointment application demonstrates the power of combining Large Language Models with healthcare scheduling. It allows users to search for doctors, check availability, and book appointments using natural language (e.g., "Find me a cardiologist in São Paulo and schedule for tomorrow at 9am").

**This app integrates with ChatGPT** using the OpenAI Apps SDK, providing an interactive widget UI that renders inline with the conversation.

## Features

- **Doctor Search:** Find healthcare professionals by name, specialty, or city.
- **Real-time Availability:** Check available appointment slots for any doctor.
- **Smart Booking:** Schedule appointments with automatic slot management.
- **Ambiguity Handling:** Intelligent disambiguation when multiple doctors match the query.
- **Interactive Widget:** Rich UI rendered inside ChatGPT with clickable doctor cards and time slots.

## Tools Definition

The MCP server exposes the following tools to ChatGPT:

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_doctors` | Retrieves a list of doctors based on optional filters. | `name?`, `specialty?`, `city?` |
| `get_available_slots` | Returns available appointment times for a doctor. | `doctorId?` \| `doctorName?`, `specialty?` |
| `schedule_appointment` | Books an appointment with a doctor. | `doctorId?` \| `doctorName?`, `slotId?` \| `slotTime?`, `patientName`, `patientPhone` |

## Resources Definition

The MCP server exposes the following resources:

| URI Pattern | Description |
| :--- | :--- |
| `doctor://list` | Returns all registered doctors |
| `doctor://{id}/slots` | Returns available slots for a specific doctor |
| `ui://widget/medical-app.html` | Interactive widget for ChatGPT UI |

## Technical Stack

- **Server:** Node.js + TypeScript (MCP SDK)
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod for schema validation
- **Transport:** HTTP (Streamable HTTP Transport)
- **UI:** Inline HTML widget with `text/html+skybridge` MIME type

## Setup & Execution

### 1. Installation

Navigate to the project directory and install dependencies:

```bash
cd apps/medical-appointment/server
npm install
```

### 2. Configuration

Create a `.env` file with your Supabase credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
```

### 3. Database Setup

1. Create a project on [Supabase](https://supabase.com)
2. Go to the **SQL Editor**
3. Run the SQL from `database/schema.sql`
4. Seed data with `database/seeds/doctors.sql`

### 4. Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server listens on `http://localhost:3001/mcp` by default.

## ChatGPT Integration

This app integrates with ChatGPT using the OpenAI Apps SDK:

### How it works

1. **Tool calls** return `structuredContent` (for the model) and `_meta` (for the widget)
2. **Widget resource** (`ui://widget/medical-app.html`) renders interactive UI
3. **Widget reads** data from `window.openai.toolOutput` and `window.openai.toolResponseMetadata`
4. **User interactions** trigger new tool calls via `window.openai.callTool()`

### Widget Views

| View | Description |
|------|-------------|
| `doctors-list` | Shows list of doctors with clickable cards |
| `slots-list` | Shows available time slots for selected doctor |
| `confirmation` | Shows booking confirmation |
| `disambiguation` | Shows options when multiple doctors match |

## Testing Guide

### Using MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Or test via HTTP:

```bash
# Configure in Inspector:
# Transport Type: Streamable HTTP
# URL: http://localhost:3001/mcp
```

### Recommended Test Prompts

| Intent | Prompt Example | Expected Result |
| :--- | :--- | :--- |
| **Doctor Search** | "Find cardiologists in São Paulo" | Lists matching doctors |
| **Availability Check** | "What times does Dr. Silva have available?" | Shows available slots |
| **Booking** | "Schedule with Dr. Silva at 9am for Maria" | Creates appointment |
| **Ambiguous Query** | "See slots for Dr. Silva" (multiple exist) | Returns disambiguation options |

## Implementation Highlights

**Widget Integration**
- Tools return `_meta` outside `structuredContent` for widget-only data
- Widget reads from `window.openai.toolResponseMetadata`
- CSP configured for Supabase and Unsplash image domains

**Ambiguity Resolution**
When multiple doctors match a name query, the system returns all matches with their specialties, allowing the LLM to ask the user for clarification.

**Slot Management**
The booking flow atomically checks availability, marks the slot as booked, and creates the appointment record - preventing double-bookings.

## Project Structure

```text
apps/medical-appointment/
├── database/             # SQL scripts
│   ├── schema.sql        # Table definitions
│   └── seeds/
│       └── doctors.sql   # Sample data
├── docs/                 # Project documentation
│   ├── 01-database-setup.md
│   ├── 02-server-architecture.md
│   ├── 03-mcp-tools.md
│   └── 04-mcp-resources.md
├── server/
│   ├── public/
│   │   └── widget.html   # Interactive ChatGPT widget
│   └── src/
│       ├── index.ts      # HTTP server + MCP setup
│       ├── config.ts     # Environment configuration
│       ├── db/           # Data access layer (Supabase)
│       ├── mcp/          # MCP tools, resources, schemas
│       └── types/        # TypeScript interfaces
└── README.md             # This file
```

## Documentation

- [Database Setup](docs/01-database-setup.md) - Schema and table definitions
- [Server Architecture](docs/02-server-architecture.md) - Code patterns and design decisions
- [MCP Tools Reference](docs/03-mcp-tools.md) - Detailed tool documentation
- [MCP Resources Reference](docs/04-mcp-resources.md) - Resource URI patterns

## Deployment

The server can be deployed to any Node.js hosting platform:

- **Railway:** Auto-deploys from GitHub
- **Vercel:** Serverless functions
- **Fly.io:** Edge deployment

Ensure `PORT` environment variable is set by your hosting provider.

## License

MIT
