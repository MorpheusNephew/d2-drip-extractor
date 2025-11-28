import { BUNGIE_API_KEY } from "@/variables";

const apiRoot = "https://www.bungi.net/Platform";

export const get = async (path: string) => {
  return fetch(`${apiRoot}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": BUNGIE_API_KEY as string,
    },
  });
};
