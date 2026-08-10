#!/usr/bin/env node
/**
 * ClimateTask MCP server.
 *
 * Tools for climate project task tracking (local JSON store), weather and
 * historical climate data (Open-Meteo), and country development indicators
 * (World Bank Open Data). All external APIs are free and require no API key.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTaskTools } from "./tools/tasks.js";
import { registerClimateTools } from "./tools/climate.js";
import { registerWorldBankTools } from "./tools/worldbank.js";

const server = new McpServer({
  name: "climatetask-mcp-server",
  version: "1.0.0",
});

registerTaskTools(server);
registerClimateTools(server);
registerWorldBankTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers must not write to stdout; stderr is safe for logs.
  console.error("climatetask-mcp-server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
