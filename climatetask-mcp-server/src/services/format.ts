import { CHARACTER_LIMIT } from "../constants.js";
import { ResponseFormat } from "../types.js";

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/**
 * Build a standard tool result carrying both a text rendering
 * (markdown or pretty JSON, per the caller's requested format)
 * and machine-readable structuredContent.
 */
export function formatResult(
  format: ResponseFormat,
  markdown: string,
  structured: Record<string, unknown>
): ToolResult {
  let text = format === ResponseFormat.MARKDOWN ? markdown : JSON.stringify(structured, null, 2);
  if (text.length > CHARACTER_LIMIT) {
    text =
      text.slice(0, CHARACTER_LIMIT) +
      `\n\n[Truncated at ${CHARACTER_LIMIT} characters. Narrow the request (fewer items, shorter date range, or use 'limit'/'offset') to see the rest.]`;
  }
  return {
    content: [{ type: "text", text }],
    structuredContent: structured,
  };
}

/** Build a standard error result (reported inside the tool result, not as a protocol error). */
export function errorResult(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${message}` }],
  };
}
