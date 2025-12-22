<div align="center">

# Real Estate App

[![Module](https://img.shields.io/badge/Module-Real_Estate-blue.svg)](./)
[![API](https://img.shields.io/badge/API-Google_Maps-green)](https://developers.google.com/maps)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success)](./)

**An intelligent property search agent capable of rendering interactive maps and filtering listings in real-time.**

[Features](#features) • [Tools](#tools) • [Setup](#setup)

</div>

---

## Overview

The Real Estate Map application demonstrates the power of combining Large Language Models with geospatial data. It allows users to query property databases using natural language (e.g., "Find me a 2-bedroom apartment in Pinheiros under 1 million") and visualizes the results on an interactive Google Map embedded directly in the chat interface.

## Features

- **Interactive Mapping:** Native integration with Google Maps API for rendering property locations.
- **Natural Language Filtering:** Advanced parsing of user intent to filter by price, type, and location.
- **Dark Mode UI:** Optimized visual design for modern chat interfaces.
- **Bi-directional Interaction:** Clicking map markers opens property details; clicking property cards highlights map locations.

## Tools Definition

The MCP server exposes the following tools to the LLM:

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_properties` | Retrieves a list of properties based on optional type filters. | `filter?`: "all" \| "casa" \| "apartamento" |
| `filter_by_price` | Filters existing property lists by a maximum price threshold. | `maxPrice`: number (BRL) |

## Technical Stack

- **Server:** Node.js + TypeScript (MCP SDK)
- **Client:** HTML5 + Vanilla JS (Widget)
- **Maps:** Google Maps Javascript API
- **Styling:** Custom CSS with Dark Theme support

## Setup & Execution

### 1. Installation

Navigate to the project directory and install dependencies:

```bash
cd apps/real-estate
npm install
```

### 2. Configuration

Ensure you have a `.env` file with your Google Maps API Key (optional for local dev if using mock data, but recommended):

```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Running the Server

Start the development server:

```bash
npm run dev
```

> The server will start on port `8787` and listen for SSE connections at `/mcp`.

## Testing Guide

To validate the application functionality without consuming LLM tokens, use the **MCP Inspector**:

```bash
npx @modelcontextprotocol/inspector sse http://localhost:8787/mcp
```

### Recommended Test Prompts

| Intent | Prompt Example | Expected Result |
| :--- | :--- | :--- |
| **Broad Search** | "Show me all available properties." | Displays map with all 5 mock listings. |
| **Type Filter** | "I am looking for an apartment." | Filters map to show only apartments (3 items). |
| **Price Filter** | "Find properties under 1.5 million." | Updates map to show listings < R$ 1.5M. |
| **Range/Complex** | "Apartments in Jardins above 1 million." | Combines type and price logic. |

## Implementation Challenges

**LLM Tool Ambiguity**
Initial tests showed the model struggling to correctly apply price filters with vague constraints (e.g., "around 1 million"). We resolved this by explicitly defining specific examples in the tool description (minPrice/maxPrice), significantly improving intent recognition accuracy.

**Property Imagery Hosting**
Rendering local images within the ChatGPT sandbox presents cross-origin availability issues. The project currently implements robust fallback placeholders to ensure visual consistency when external image URLs are unreachable or blocked.

**Inspector Protocol Mismatch**
A common setup hurdle involves the MCP Inspector defaulting to HTTP transport. This server strictly implements Server-Sent Events (SSE), requiring manual transport selection in the debugging tool to avoid connection timeouts.

## Project Structure

```text
apps/real-estate/
├── public/
│   └── widget.html       # Single-file optimized frontend widget
├── src/
│   ├── config/           # Environment variables & constants
│   ├── data/             # Mock data and TypeScript interfaces
│   └── utils/            # Helper functions (logger, formatters)
├── server.ts             # Main MCP server entry point
├── tsconfig.json         # TypeScript configuration
└── package.json          # Module dependencies
```
