# 02. Server Architecture & Code Patterns

This document explains the technical decisions behind the Server infrastructure (`apps/medical-appointment/server`).

## 1. Modular Architecture (Split Service)

We separated the "Brain" (Server) from the "Face" (Web) to ensure scalability.

```txt
apps/medical-appointment/
├── server/      (Node.js + MCP + Supabase)
└── web/         (React + Vite UI)
```

## 2. Server Internal Structure (`server/src`)

Inside the server, we use a **Modular Monolith** approach to separate concerns.

```txt
src/
├── index.ts           # Entry Point (Registers MCP Capabilities)
├── config.ts          # Environment Config (The "Gatekeeper")
│
├── db/                # Data Access Layer (The "Chef")
│   ├── client.ts      # Single Supabase Connection Instance
│   └── doctors.ts     # Pure Business Logic (No MCP code here)
│
├── mcp/               # Protocol Layer (The "Waiter")
│   ├── resources.ts   # Exposes Data (doctor://...)
│   └── tools.ts       # Exposes Actions (schedule_appointment)
│
└── types/             # Shared TypeScript Interfaces
```

## 3. Key Implementations

### A. Centralized Configuration (`config.ts`)
We do not use `process.env` directly in the code. We validade it first.
- **Why?** Prevents silent failures if a key is missing.
- **How?** Using `zod` to validate `.env` content before the app starts.

### B. Database Isolation (`db/`)
The `db` folder knows nothing about MCP or AI. It only returns Data (Objects) or Null.
- **Why?** Allows changing the database (e.g. to Firebase) without breaking the AI Logic.
- **Pattern**: Functions return `Promise<Type | null>` instead of throwing errors for missing data.

### C. Resource Exposure (`mcp/`)
This layer imports functions from `db/` and wraps them in MCP protocol messages.
- **Analogy**: The MCP layer is just the "Waiter" serving the dishes prepared by the "Chef" (DB Layer).
- **Templates**: We use **Resource Templates** for dynamic filtering (e.g., `doctor://list/specialty/{name}`).

