import { BUNGIE_API_KEY, BUNGIE_PLATFORM } from "./variables";

export const get = async <T>(
  path: string,
  accessToken: string,
  query?: Record<string, string>
) => {
  const url = new URL(`${BUNGIE_PLATFORM}${path}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": BUNGIE_API_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Bungie GET failed: ${res.status} ${path}`);

  const body = await res.json();

  return body.Response as T;
};
