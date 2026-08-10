import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IndicatorPoint, ResponseFormat } from "../types.js";
import { WORLD_BANK_API_URL } from "../constants.js";
import { getJson } from "../services/http.js";
import { errorResult, formatResult } from "../services/format.js";

const responseFormatField = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

/** World Bank API returns [metadata, rows] tuples. */
type WorldBankResponse<T> = [
  { page: number; pages: number; per_page: number; total: number; message?: unknown },
  T[] | null,
];

interface WorldBankDataRow {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
}

export function registerWorldBankTools(server: McpServer): void {
  server.registerTool(
    "climatetask_get_country_indicator",
    {
      title: "Get Country Indicator (World Bank)",
      description: `Fetch a time series for a World Bank development indicator for one country, via the free World Bank Open Data API (no key required).

Useful climate/development indicator codes:
  - EN.GHG.CO2.PC.CE.AR5  CO2 emissions per capita (t CO2e)
  - AG.LND.FRST.ZS        Forest area (% of land area)
  - EG.ELC.ACCS.ZS        Access to electricity (% of population)
  - SP.POP.TOTL           Total population
  - NY.GDP.MKTP.CD        GDP (current US$)
  - NY.GDP.PCAP.CD        GDP per capita (current US$)
  - SP.RUR.TOTL.ZS        Rural population (% of total)
  - AG.LND.AGRI.ZS        Agricultural land (% of land area)
Any other valid World Bank indicator code also works.

Args:
  - country (string, required): ISO3 code, e.g. "GIN" (Guinea), "SEN" (Senegal); ISO2 also accepted
  - indicator (string, required): World Bank indicator code, e.g. "SP.POP.TOTL"
  - start_year, end_year (numbers, optional): Restrict the year range, e.g. 2000-2022
  - response_format ('markdown' | 'json', default 'markdown')

Returns: { country, country_code, indicator, indicator_code, points: [{ year, value }] } — years descending, null value means no data reported for that year.

Error Handling: An unknown country or indicator code returns an explanatory error; check the code spelling.`,
      inputSchema: {
        country: z
          .string()
          .regex(/^[A-Za-z]{2,3}$/, "Country must be an ISO2 or ISO3 code, e.g. 'GN' or 'GIN'")
          .describe("ISO2/ISO3 country code"),
        indicator: z
          .string()
          .min(3)
          .max(30)
          .describe("World Bank indicator code, e.g. 'SP.POP.TOTL'"),
        start_year: z.number().int().min(1960).max(2100).optional().describe("First year"),
        end_year: z.number().int().min(1960).max(2100).optional().describe("Last year"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        if (params.start_year && params.end_year && params.start_year > params.end_year) {
          throw new Error("start_year must be on or before end_year.");
        }
        const date =
          params.start_year || params.end_year
            ? `${params.start_year ?? 1960}:${params.end_year ?? new Date().getFullYear()}`
            : undefined;
        const data = await getJson<WorldBankResponse<WorldBankDataRow>>(
          `${WORLD_BANK_API_URL}/country/${encodeURIComponent(params.country)}/indicator/${encodeURIComponent(params.indicator)}`,
          { format: "json", per_page: 200, ...(date ? { date } : {}) }
        );

        const [meta, rows] = data;
        if (!rows || !rows.length) {
          const hint =
            meta && "message" in meta && meta.message
              ? "The World Bank API rejected the request — check the country and indicator codes."
              : `No data for indicator '${params.indicator}' in country '${params.country}' for the requested years.`;
          return {
            content: [{ type: "text" as const, text: hint }],
          };
        }

        const points: IndicatorPoint[] = rows.map((r) => ({ year: r.date, value: r.value }));
        const structured = {
          country: rows[0].country.value,
          country_code: rows[0].countryiso3code,
          indicator: rows[0].indicator.value,
          indicator_code: rows[0].indicator.id,
          count: points.length,
          points,
        } as unknown as Record<string, unknown>;

        const lines = [
          `# ${rows[0].indicator.value}`,
          "",
          `Country: ${rows[0].country.value} (${rows[0].countryiso3code}) | Indicator: ${rows[0].indicator.id}`,
          "",
          "| Year | Value |",
          "|------|-------|",
          ...points.map((p) => `| ${p.year} | ${p.value ?? "–"} |`),
        ];
        return formatResult(params.response_format, lines.join("\n"), structured);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
