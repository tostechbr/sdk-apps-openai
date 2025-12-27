# 02. Server Architecture & Code Patterns

This document explains the technical decisions behind the Server infrastructure (`apps/medical-appointment/server`).

## 1. Architecture Overview

The server is an **HTTP MCP Server** that integrates with ChatGPT using the OpenAI Apps SDK.

```txt
apps/medical-appointment/
├── database/    # SQL scripts (schema + seeds)
├── docs/        # Documentation
└── server/      # Node.js + MCP + Supabase + Widget
```

## 2. Server Internal Structure (`server/src`)

Inside the server, we use a **Modular Monolith** approach to separate concerns.

```txt
server/
├── public/
│   └── widget.html       # Interactive ChatGPT widget (text/html+skybridge)
│
└── src/
    ├── index.ts          # HTTP Server + MCP Setup
    ├── config.ts         # Environment Config (Zod validation)
    │
    ├── db/               # Data Access Layer
    │   ├── client.ts     # Single Supabase Connection Instance
    │   ├── doctors.ts    # Doctor queries and search logic
    │   └── appointments.ts # Appointment creation and slot management
    │
    ├── mcp/              # Protocol Layer
    │   ├── resources.ts  # Exposes Data + Widget (doctor://, ui://)
    │   ├── schemas.ts    # Zod input schemas for tools
    │   └── tools.ts      # Exposes Actions (search_doctors, etc.)
    │
    └── types/            # Shared TypeScript Interfaces
        └── index.ts      # Doctor, TimeSlot, Appointment, etc.
```

## 3. HTTP Transport

The server uses **Streamable HTTP Transport** (not STDIO) for ChatGPT integration:

```typescript
// index.ts
const PORT = Number(process.env.PORT ?? 3001);
const MCP_PATH = "/mcp";

// Endpoints:
// GET  /      → Health check
// POST /mcp   → MCP requests
// GET  /mcp   → MCP requests
// DELETE /mcp → MCP requests
```

Each request creates a new MCP server instance (stateless mode).

## 4. Key Implementations

### A. Centralized Configuration (`config.ts`)
We validate environment variables before the app starts.
- **Why?** Prevents silent failures if a key is missing.
- **How?** Using `zod` to validate `.env` content.

```typescript
const envSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
});
```

### B. Database Isolation (`db/`)
The `db` folder knows nothing about MCP or AI. It only returns Data or Null.
- **Why?** Allows changing the database without breaking the AI Logic.
- **Pattern**: Functions return `Promise<Type | null>` instead of throwing errors.

### C. MCP Layer (`mcp/`)
This layer imports functions from `db/` and wraps them in MCP protocol messages.

**Tools** return structured responses:
```typescript
return {
    content: [...],           // Text for the model
    structuredContent: {...}, // JSON for model + widget
    _meta: {...},             // Widget-only data (hidden from model)
};
```

**Key insight:** `_meta` must be at the same level as `structuredContent`, not inside it. The widget reads `_meta` from `window.openai.toolResponseMetadata`.

### D. Widget Integration (`public/widget.html`)
The widget is an inline HTML file served with MIME type `text/html+skybridge`.

- Registered as resource: `ui://widget/medical-app.html`
- Referenced in tools via: `_meta["openai/outputTemplate"]`
- Reads data from: `window.openai.toolOutput` and `window.openai.toolResponseMetadata`
- Triggers actions via: `window.openai.callTool()`

## 5. Data Flow

```
User Message
    ↓
ChatGPT Model → calls MCP tool
    ↓
HTTP POST /mcp
    ↓
Tool handler (tools.ts)
    ↓
Database query (db/*.ts)
    ↓
Response: { content, structuredContent, _meta }
    ↓
ChatGPT renders widget (widget.html)
    ↓
Widget reads window.openai.toolOutput + toolResponseMetadata
    ↓
User clicks → widget calls window.openai.callTool()
    ↓
Cycle repeats
```

## 6. CSP Configuration

The widget declares allowed domains for Content Security Policy:

```typescript
"openai/widgetCSP": {
    connect_domains: ["https://*.supabase.co"],
    resource_domains: ["https://*.supabase.co", "https://images.unsplash.com"],
}
```

- `connect_domains`: API calls (Supabase)
- `resource_domains`: Static assets (images)
