# Medical Appointment MCP Server

An MCP (Model Context Protocol) server for medical appointment scheduling, built with TypeScript and Supabase.

## Features

- **Search Doctors** - Find doctors by name, specialty, or city
- **View Availability** - Check available appointment slots
- **Book Appointments** - Schedule appointments with doctors

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- MCP-compatible client 

### Installation

```bash
cd apps/medical-appointment/server
npm install
```

### Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

1. Create a Supabase project
2. Run the SQL from `src/schema.sql` in the SQL Editor

### Running

```bash
npm run dev
```

## Architecture

```
server/
├── src/
│   ├── index.ts          # Entry point
│   ├── config.ts         # Environment validation
│   ├── db/               # Data access layer
│   │   ├── client.ts     # Supabase connection
│   │   ├── doctors.ts    # Doctor queries
│   │   └── appointments.ts # Appointment logic
│   ├── mcp/              # MCP protocol layer
│   │   ├── tools.ts      # Action handlers
│   │   ├── schemas.ts    # Zod input schemas
│   │   └── resources.ts  # Data resources
│   └── types/            # TypeScript interfaces
```

## MCP Capabilities

### Tools

| Tool | Description |
|------|-------------|
| `search_doctors` | Find doctors by filters |
| `get_available_slots` | View doctor availability |
| `schedule_appointment` | Book an appointment |

### Resources

| URI | Description |
|-----|-------------|
| `doctor://list` | All registered doctors |
| `doctor://{id}/slots` | Available slots for a doctor |

## Documentation

- [01-database-setup.md](docs/01-database-setup.md) - Database schema
- [02-server-architecture.md](docs/02-server-architecture.md) - Code patterns
- [03-mcp-tools.md](docs/03-mcp-tools.md) - Tools reference
- [04-mcp-resources.md](docs/04-mcp-resources.md) - Resources reference

## License

MIT
