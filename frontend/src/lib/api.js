// import { ApiError } from "./api-errors";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// export async function apiRequest(path, options = {}) {
//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     credentials: "include",
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   });

//   const body = await response.json().catch(() => null);

//   if (!response.ok) {
//     const message = Array.isArray(body?.message)
//       ? body.message.join(", ")
//       : body?.message || "Something went wrong. Please try again.";

//     throw new ApiError(message, response.status, body);
//   }

//   return body;
// }


import { ApiError } from "./api-errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const endpoint = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(endpoint, {
    credentials: "include",
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
