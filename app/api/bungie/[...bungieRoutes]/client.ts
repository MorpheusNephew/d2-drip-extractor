const apiRoot = "https://www.bungie.net/Platform";

export const get = async (
  path: string,
  accessToken: string,
  query?: Record<string, string>
) => {
  const url = new URL(`${apiRoot}${path}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  return fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.BUNGIE_API_KEY as string,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
