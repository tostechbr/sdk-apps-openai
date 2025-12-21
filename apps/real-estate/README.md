# Real Estate Map

Interactive real estate property listing application built with OpenAI Apps SDK and Leaflet.js.

## Overview

This application demonstrates how to create an interactive map-based interface within ChatGPT. Users can search for properties, apply filters, and view results on an embedded map with detailed property information.

## Features

- Interactive map with property markers showing prices
- Filter properties by type (house/apartment)
- Filter properties by maximum price
- Responsive property cards with detailed information
- Real-time updates through ChatGPT conversation

## Demo Data

The application includes 2 mock properties in São Paulo, Brazil:

1. Modern House in Pinheiros - R$ 850,000
   - 3 bedrooms, 2 bathrooms, 120m²
   
2. Apartment in Itaim Bibi - R$ 620,000
   - 2 bedrooms, 2 bathrooms, 85m²

## Technical Architecture

### MCP Server

The backend implements the Model Context Protocol with two tools:

**search_properties**
- Description: Search for real estate properties with optional type filtering
- Parameters: `filter` (optional): "all" | "casa" | "apartamento"
- Returns: Structured property data

**filter_by_price**
- Description: Filter properties by maximum price
- Parameters: `maxPrice` (required): number in BRL
- Returns: Properties below the specified price

### Widget

The frontend widget uses:
- Leaflet.js for interactive mapping
- OpenStreetMap for map tiles
- Custom markers displaying property prices
- Responsive card layout for property details

## Installation

Install dependencies:

```bash
npm install
```

## Local Development

Start the MCP server:

```bash
npm start
```

Server will be available at `http://localhost:8787/mcp`

## Testing

### Using MCP Inspector

Test the application locally:

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

The Inspector provides a testing interface where you can:
- View available tools
- Execute tool calls
- Inspect responses
- Test the widget rendering

### Testing in ChatGPT

1. Enable Developer Mode in ChatGPT Settings
2. Expose your local server using ngrok or deploy to a public URL
3. Add a new connector with your server URL + `/mcp`
4. Start a conversation and test with prompts like:
   - "Show me properties for sale"
   - "Show houses under R$ 900,000"
   - "Find apartments available"

## Deployment

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Initialize and deploy:
```bash
railway login
railway init
railway up
```

3. Set environment variables if needed:
```bash
railway variables set PORT=8787
```

4. Get your deployment URL:
```bash
railway domain
```

Use this URL + `/mcp` in your ChatGPT connector configuration.

### Other Platforms

The application can be deployed to:
- Vercel (as Node.js serverless function)
- Heroku (as standard Node.js app)
- Docker (containerized deployment)
- Traditional VPS (standard Node.js hosting)

## Configuration

Key configuration in `server.js`:

- `PORT`: Server port (default: 8787, configurable via environment variable)
- `MOCK_PROPERTIES`: Array of property objects (can be replaced with database queries)

## API Reference

### Server Endpoints

- `GET /` - Health check endpoint
- `POST /mcp` - MCP protocol endpoint
- `GET /mcp` - MCP protocol endpoint (SSE)
- `DELETE /mcp` - MCP protocol endpoint

### Widget Integration

The widget receives data through `window.openai`:

```javascript
window.openai.toolOutput.properties  // Property data
window.openai.callTool()            // Call server tools
window.openai.theme                 // Current theme
```

## Project Structure

```
apps/real-estate/
├── public/
│   └── widget.html       # Frontend widget
├── server.js             # MCP server implementation
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP server implementation
- `zod` - Schema validation

## Browser Compatibility

The widget uses modern web standards and is compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Known Limitations

- Mock data only (no database persistence)
- Limited to 2 sample properties
- Stateless server (data resets on restart)
- No authentication

## Future Enhancements

- Database integration for persistent storage
- User authentication with OAuth
- More comprehensive property data
- Advanced filtering options
- Property detail modal views
- Favorites and saved searches
- Export functionality

## Support

For issues or questions:
- Check the main repository README
- Review OpenAI Apps SDK documentation
- Open an issue in the repository

## License

MIT
