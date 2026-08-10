# climatetask-mcp-server

An MCP (Model Context Protocol) server combining three things:

1. **Task tracking** for climate project work — proposal deadlines, review milestones,
   fund submissions — stored in a local JSON file.
2. **Live climate data** from [Open-Meteo](https://open-meteo.com) (geocoding, weather
   forecasts, historical daily climate back to 1940). Free, no API key.
3. **Country development indicators** from the
   [World Bank Open Data API](https://datahelpdesk.worldbank.org/knowledgebase/topics/125589)
   (population, GDP, emissions, forest cover, electricity access, …). Free, no API key.

It also serves as a clean TypeScript template for building further MCP servers: shared
HTTP/formatting/storage services, Zod-validated inputs, structured content output,
pagination, truncation, and tool annotations are all wired up.

## Tools

| Tool | Kind | Description |
|------|------|-------------|
| `climatetask_create_task` | local write | Create a task (title, priority, due date, tags) |
| `climatetask_list_tasks` | local read | List/filter tasks (status, tag, search) with pagination, due-soonest first |
| `climatetask_update_task` | local write | Update any task fields, move deadlines, change status |
| `climatetask_delete_task` | local write (destructive) | Permanently delete a task |
| `climatetask_geocode_location` | external read | Place name → coordinates (Open-Meteo geocoding) |
| `climatetask_get_weather_forecast` | external read | Daily forecast up to 16 days (Open-Meteo) |
| `climatetask_get_climate_history` | external read | Historical daily temperature/precipitation from 1940 (Open-Meteo archive) |
| `climatetask_get_country_indicator` | external read | World Bank indicator time series per country |

All data tools accept `response_format: "markdown" | "json"` and also return
machine-readable `structuredContent`.

## Setup

```bash
cd climatetask-mcp-server
npm install
npm run build
```

### Add to Claude Code

```bash
claude mcp add climatetask -- node /absolute/path/to/climatetask-mcp-server/dist/index.js
```

### Add to Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "climatetask": {
      "command": "node",
      "args": ["/absolute/path/to/climatetask-mcp-server/dist/index.js"]
    }
  }
}
```

## Configuration

| Environment variable | Default | Purpose |
|----------------------|---------|---------|
| `CLIMATETASK_DATA_FILE` | `~/.climatetask/tasks.json` | Where tasks are stored |

No API keys are needed — both external APIs are free and unauthenticated.

**Corporate proxies:** Node's built-in `fetch` ignores `HTTPS_PROXY` before Node 24.
On Node 24+, set `NODE_USE_ENV_PROXY=1` (and `NODE_EXTRA_CA_CERTS` if your proxy
re-signs TLS) in the server's environment.

## Examples

- *"Track a task: submit the SARITEM-2 response matrix to FRLD by 15 September, high priority."*
  → `climatetask_create_task`
- *"What's coming due this month tagged GCF?"* → `climatetask_list_tasks`
- *"How much rain fell in Conakry during the first week of August 2020?"*
  → `climatetask_geocode_location` + `climatetask_get_climate_history`
- *"Plot Guinea's forest cover since 2000."*
  → `climatetask_get_country_indicator` with `AG.LND.FRST.ZS`

## Development

```bash
npm run dev      # run from source with auto-reload (tsx)
npm run build    # compile to dist/
npm start        # run compiled server (stdio transport)
npx @modelcontextprotocol/inspector node dist/index.js   # interactive testing
```

Project layout:

```
src/
├── index.ts          # server bootstrap (stdio transport)
├── constants.ts      # API URLs, limits
├── types.ts          # shared enums/interfaces
├── services/
│   ├── http.ts       # JSON GET helper with timeout + actionable errors
│   ├── format.ts     # markdown/JSON result builder, truncation, error results
│   └── store.ts      # JSON-file task store
└── tools/
    ├── tasks.ts      # task CRUD tools
    ├── climate.ts    # Open-Meteo tools
    └── worldbank.ts  # World Bank tool
```

To extend it with a new external API: add the base URL to `constants.ts`, create a
`src/tools/<domain>.ts` with a `register<Domain>Tools(server)` function following the
existing pattern, and call it from `index.ts`.
