const apiRoot = "https://www.bungie.net/Platform";

export const get = async (path: string, accessToken: string) => {
  const url = `${apiRoot}${path}`;

  console.log({ url });

  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.BUNGIE_API_KEY as string,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
