import { ApiError } from "./api-errors";

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"
)
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

export async function apiServerRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message || "Something went wrong. Please try again.";

    throw new ApiError(message, response.status, body);
  }

  return body;
}

export function apiServerGet(path) {
  return apiServerRequest(path);
}
