<div align="center">

# Medical Appointment

[![Module](https://img.shields.io/badge/Module-Medical_Appointment-blue.svg)](./)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![Status](https://img.shields.io/badge/Status-In_Development-yellow)](./)

**An intelligent medical appointment scheduling system with doctor search, availability checking, and booking capabilities.**

[Features](#features) • [Tools](#tools-definition) • [Setup](#setup--execution)

</div>

---

## Overview

The Medical Appointment application demonstrates the power of combining Large Language Models with healthcare scheduling. It allows users to search for doctors, check availability, and book appointments using natural language (e.g., "Find me a cardiologist in São Paulo and schedule for tomorrow at 9am").

## Features

- **Doctor Search:** Find healthcare professionals by name, specialty, or city.
- **Real-time Availability:** Check available appointment slots for any doctor.
- **Smart Booking:** Schedule appointments with automatic slot management.
- **Ambiguity Handling:** Intelligent disambiguation when multiple doctors match the query.

## Tools Definition

The MCP server exposes the following tools to the LLM:

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

## Technical Stack

- **Server:** Node.js + TypeScript (MCP SDK)
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod for schema validation
- **Transport:** STDIO (local integration)

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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

1. Create a project on [Supabase](https://supabase.com)
2. Go to the **SQL Editor**
3. Run the SQL from `src/schema.sql`

### 4. Running the Server

Start the development server:

```bash
npm run dev
```

> The server communicates via STDIO transport for local MCP client integration.

## Testing Guide

To validate the application functionality, use the **MCP Inspector**:

```bash
npx @modelcontextprotocol/inspector stdio -- node dist/index.js
```

### Recommended Test Prompts

| Intent | Prompt Example | Expected Result |
| :--- | :--- | :--- |
| **Doctor Search** | "Find cardiologists in São Paulo" | Lists matching doctors |
| **Availability Check** | "What times does Dr. Silva have available?" | Shows available slots |
| **Booking** | "Schedule with Dr. Silva at 9am for Maria" | Creates appointment |
| **Ambiguous Query** | "See slots for Dr. Silva" (multiple exist) | Returns disambiguation options |

## Implementation Highlights

**Ambiguity Resolution**
When multiple doctors match a name query, the system returns all matches with their specialties, allowing the LLM to ask the user for clarification or use additional context to disambiguate.

**Slot Management**
The booking flow atomically checks availability, marks the slot as booked, and creates the appointment record - preventing double-bookings.

**Type-Safe Schemas**
All tool inputs are validated using Zod schemas defined in a centralized `schemas.ts` file, ensuring consistent validation across tools.

## Project Structure

```text
apps/medical-appointment/
├── docs/                 # Project documentation
│   ├── 01-database-setup.md
│   ├── 02-server-architecture.md
│   ├── 03-mcp-tools.md
│   └── 04-mcp-resources.md
├── server/
│   └── src/
│       ├── index.ts      # Main MCP server entry point
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

## License

MIT
