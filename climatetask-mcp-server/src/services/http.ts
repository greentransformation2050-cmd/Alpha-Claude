import { REQUEST_TIMEOUT_MS } from "../constants.js";

/**
 * Perform a GET request against a JSON API with a timeout and
 * actionable error messages. Uses the global fetch (Node 18+).
 */
export async function getJson<T>(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        `Request to ${url.hostname} timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Please try again.`
      );
    }
    throw new Error(
      `Could not reach ${url.hostname}: ${error instanceof Error ? error.message : String(error)}. Check network connectivity and retry.`
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    switch (response.status) {
      case 404:
        throw new Error(
          `Resource not found at ${url.hostname} (404). Check that identifiers (location, country code, indicator code) are correct.`
        );
      case 429:
        throw new Error(
          `Rate limit exceeded on ${url.hostname} (429). Wait a moment before retrying.`
        );
      default:
        throw new Error(
          `${url.hostname} returned HTTP ${response.status}. ${body.slice(0, 200)}`
        );
    }
  }

  return (await response.json()) as T;
}
