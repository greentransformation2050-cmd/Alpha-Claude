import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { GeocodingResult, ResponseFormat } from "../types.js";
import {
  OPEN_METEO_ARCHIVE_URL,
  OPEN_METEO_FORECAST_URL,
  OPEN_METEO_GEOCODING_URL,
} from "../constants.js";
import { getJson } from "../services/http.js";
import { errorResult, formatResult } from "../services/format.js";

const responseFormatField = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

const latitudeField = z.number().min(-90).max(90).describe("Latitude in decimal degrees");
const longitudeField = z.number().min(-180).max(180).describe("Longitude in decimal degrees");
const isoDateField = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be in YYYY-MM-DD format`)
    .describe(`${label} in YYYY-MM-DD format`);

interface GeocodingResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    country_code?: string;
    admin1?: string;
    timezone?: string;
    population?: number;
    elevation?: number;
  }>;
}

interface DailyWeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily?: {
    time: string[];
    temperature_2m_max: Array<number | null>;
    temperature_2m_min: Array<number | null>;
    precipitation_sum: Array<number | null>;
  };
}

interface DailySeries {
  date: string;
  temp_max_c: number | null;
  temp_min_c: number | null;
  precipitation_mm: number | null;
}

function toDailySeries(data: DailyWeatherResponse): DailySeries[] {
  const daily = data.daily;
  if (!daily) return [];
  return daily.time.map((date, i) => ({
    date,
    temp_max_c: daily.temperature_2m_max[i] ?? null,
    temp_min_c: daily.temperature_2m_min[i] ?? null,
    precipitation_mm: daily.precipitation_sum[i] ?? null,
  }));
}

function dailySeriesMarkdown(title: string, data: DailyWeatherResponse, series: DailySeries[]): string {
  const lines = [
    `# ${title}`,
    "",
    `Location: ${data.latitude.toFixed(3)}, ${data.longitude.toFixed(3)} (timezone: ${data.timezone})`,
    "",
    "| Date | Max °C | Min °C | Precip. mm |",
    "|------|--------|--------|------------|",
  ];
  for (const day of series) {
    lines.push(
      `| ${day.date} | ${day.temp_max_c ?? "–"} | ${day.temp_min_c ?? "–"} | ${day.precipitation_mm ?? "–"} |`
    );
  }
  return lines.join("\n");
}

export function registerClimateTools(server: McpServer): void {
  server.registerTool(
    "climatetask_geocode_location",
    {
      title: "Geocode Location",
      description: `Resolve a place name to geographic coordinates using the free Open-Meteo geocoding API (no key required).

Use this first to get latitude/longitude for the weather tools.

Args:
  - name (string, required): Place name, e.g. "Conakry" or "Boke"
  - count (number, 1-10, default 5): Maximum matches to return
  - response_format ('markdown' | 'json', default 'markdown')

Returns: { count, results: [{ name, latitude, longitude, country, country_code, admin1, timezone, population?, elevation? }] }

Error Handling: Returns "No locations found" if the name matches nothing — try an alternative spelling.`,
      inputSchema: {
        name: z.string().min(2).max(100).describe("Place name to search for"),
        count: z.number().int().min(1).max(10).default(5).describe("Maximum matches"),
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
        const data = await getJson<GeocodingResponse>(OPEN_METEO_GEOCODING_URL, {
          name: params.name,
          count: params.count,
          language: "en",
          format: "json",
        });
        const results: GeocodingResult[] = (data.results ?? []).map((r) => ({
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          country: r.country,
          country_code: r.country_code,
          admin1: r.admin1,
          timezone: r.timezone,
          population: r.population,
          elevation: r.elevation,
        }));
        if (!results.length) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No locations found matching '${params.name}'. Try an alternative spelling or a larger nearby city.`,
              },
            ],
          };
        }
        const structured = { count: results.length, results } as unknown as Record<string, unknown>;
        const lines = [`# Locations matching '${params.name}'`, ""];
        for (const r of results) {
          lines.push(
            `- **${r.name}**${r.admin1 ? `, ${r.admin1}` : ""}${r.country ? `, ${r.country}` : ""} — lat ${r.latitude}, lon ${r.longitude}${r.timezone ? ` (${r.timezone})` : ""}`
          );
        }
        return formatResult(params.response_format, lines.join("\n"), structured);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "climatetask_get_weather_forecast",
    {
      title: "Get Weather Forecast",
      description: `Get a daily weather forecast (max/min temperature °C and precipitation mm) for coordinates, via the free Open-Meteo forecast API (no key required).

Use climatetask_geocode_location first if you only have a place name.

Args:
  - latitude, longitude (numbers, required)
  - forecast_days (number, 1-16, default 7)
  - response_format ('markdown' | 'json', default 'markdown')

Returns: { latitude, longitude, timezone, days: [{ date, temp_max_c, temp_min_c, precipitation_mm }] }`,
      inputSchema: {
        latitude: latitudeField,
        longitude: longitudeField,
        forecast_days: z.number().int().min(1).max(16).default(7).describe("Days ahead to forecast"),
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
        const data = await getJson<DailyWeatherResponse>(OPEN_METEO_FORECAST_URL, {
          latitude: params.latitude,
          longitude: params.longitude,
          forecast_days: params.forecast_days,
          daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
          timezone: "auto",
        });
        const days = toDailySeries(data);
        const structured = {
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          days,
        } as unknown as Record<string, unknown>;
        return formatResult(
          params.response_format,
          dailySeriesMarkdown(`Weather forecast (${days.length} days)`, data, days),
          structured
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "climatetask_get_climate_history",
    {
      title: "Get Historical Climate Data",
      description: `Get historical daily weather observations (max/min temperature °C and precipitation mm) for coordinates and a date range, via the free Open-Meteo archive API (reanalysis data from 1940 onward, no key required).

Useful for climate risk profiles, vulnerability assessments, and proposal evidence (e.g. rainfall during a flood event).

Args:
  - latitude, longitude (numbers, required)
  - start_date, end_date (strings, required): YYYY-MM-DD; keep ranges under ~1 year per call to avoid oversized responses
  - response_format ('markdown' | 'json', default 'markdown')

Returns: { latitude, longitude, timezone, days: [{ date, temp_max_c, temp_min_c, precipitation_mm }] }

Error Handling: Very recent dates (last ~5 days) may not yet be in the archive; use the forecast tool for current conditions.`,
      inputSchema: {
        latitude: latitudeField,
        longitude: longitudeField,
        start_date: isoDateField("start_date"),
        end_date: isoDateField("end_date"),
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
        if (params.start_date > params.end_date) {
          throw new Error("start_date must be on or before end_date.");
        }
        const data = await getJson<DailyWeatherResponse>(OPEN_METEO_ARCHIVE_URL, {
          latitude: params.latitude,
          longitude: params.longitude,
          start_date: params.start_date,
          end_date: params.end_date,
          daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
          timezone: "auto",
        });
        const days = toDailySeries(data);
        const structured = {
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          days,
        } as unknown as Record<string, unknown>;
        return formatResult(
          params.response_format,
          dailySeriesMarkdown(
            `Historical climate data ${params.start_date} → ${params.end_date}`,
            data,
            days
          ),
          structured
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
