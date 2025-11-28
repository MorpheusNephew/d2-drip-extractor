import { BUNGIE_API_KEY } from "@/variables";

const apiRoot = "https://www.bungi.net/Platform";

export const get = async (path: string) => {
  console.log({ path, BUNGIE_API_KEY });

  return fetch(`${apiRoot}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": BUNGIE_API_KEY as string,
    },
  });
};
