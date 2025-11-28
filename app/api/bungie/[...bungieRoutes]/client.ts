const apiRoot = "https://www.bungi.net/Platform";

export const get = async (path: string) => {
  return fetch(`${apiRoot}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BUNGIE_API_KEY as string,
    },
  });
};
