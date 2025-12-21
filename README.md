# OpenAI Apps SDK - Demo Gallery

A collection of demo applications showcasing different use cases for the OpenAI Apps SDK. Each application demonstrates how to build interactive experiences within ChatGPT using the Model Context Protocol (MCP).

## Overview

This repository contains practical examples of ChatGPT Apps that leverage the OpenAI Apps SDK to create rich, interactive user interfaces rendered directly in ChatGPT conversations. Each demo is self-contained and can be deployed independently.

## Available Demos

### Real Estate Map

An interactive property listing application featuring an embedded map powered by Leaflet.js. Users can search and filter real estate properties, with results displayed on an interactive map with property markers and detailed cards.

**Features:**
- Interactive map with property markers
- Property filtering by type (house/apartment)
- Price-based filtering
- Responsive property cards
- Mock data for demonstration

**Directory:** `apps/real-estate/`

[View Documentation](apps/real-estate/README.md)

## Technology Stack

- **Protocol:** Model Context Protocol (MCP)
- **Backend:** Node.js with @modelcontextprotocol/sdk
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Validation:** Zod schema validation
- **Transport:** HTTP with Server-Sent Events

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI ChatGPT account with Developer Mode enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sdk-apps-openai.git
cd sdk-apps-openai
```

2. Navigate to a specific app:
```bash
cd apps/real-estate
```

3. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```

### Testing Locally

Use the MCP Inspector to test your application:

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

### Deployment

Each application can be deployed to various platforms:

- **Railway:** Use the Railway CLI for quick deployment
- **Vercel:** Deploy as a Node.js serverless function
- **Docker:** Build and deploy as a container
- **Traditional VPS:** Deploy as a standard Node.js application

Refer to individual app documentation for specific deployment instructions.

## Project Structure

```
sdk-apps-openai/
├── apps/
│   └── real-estate/          # Real estate map demo
│       ├── public/
│       │   └── widget.html   # UI widget
│       ├── server.js         # MCP server
│       ├── package.json
│       └── README.md
├── .gitignore
└── README.md                 # This file
```

## Contributing

Contributions are welcome! Each demo application should:

- Be self-contained within its own directory
- Include comprehensive documentation
- Follow the MCP specification
- Include example data for testing
- Be deployment-ready

## Resources

- [OpenAI Apps SDK Documentation](https://platform.openai.com/docs/apps-sdk)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP SDK TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Open an issue in this repository
- Refer to the OpenAI Apps SDK documentation
- Check individual app README files
