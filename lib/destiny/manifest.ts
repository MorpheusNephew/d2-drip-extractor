import type {
  DestinyManifest,
  DestinyInventoryItemDefinition,
  DestinyCollectibleDefinition,
  DestinyPlugSetDefinition,
} from "bungie-api-ts/destiny2";

import { bungieClient, BUNGIE_BASE } from "@/lib/bungie";

export async function fetchDestinyManifest(
  accessToken: string
): Promise<DestinyManifest> {
  return bungieClient.get<DestinyManifest>("/Destiny2/Manifest", accessToken);
}

export interface ManifestSlice {
  inventoryItemsByHash: Map<number, DestinyInventoryItemDefinition>;
  collectiblesByHash: Map<number, DestinyCollectibleDefinition>;
  plugSetsByHash: Map<number, DestinyPlugSetDefinition>;
}

export async function loadManifestSlice(
  accessToken: string,
  language = "en"
): Promise<ManifestSlice> {
  const manifest = await fetchDestinyManifest(accessToken);

  const paths = manifest.jsonWorldComponentContentPaths[language];
  if (!paths) throw new Error(`No manifest for language ${language}`);

  const itemPath = paths.DestinyInventoryItemDefinition;
  const collectiblePath = paths.DestinyCollectibleDefinition;
  const plugsetPath = paths.DestinyPlugSetDefinition;

  const [itemDefs, collectibleDefs, plugSetDefs] = await Promise.all([
    fetch(`${BUNGIE_BASE}${itemPath}`).then((r) => r.json()),
    fetch(`${BUNGIE_BASE}${collectiblePath}`).then((r) => r.json()),
    fetch(`${BUNGIE_BASE}${plugsetPath}`).then((r) => r.json()),
  ]);

  return {
    inventoryItemsByHash: new Map(
      Object.entries(itemDefs).map(([k, v]) => [
        Number(k),
        v as DestinyInventoryItemDefinition,
      ])
    ),
    collectiblesByHash: new Map(
      Object.entries(collectibleDefs).map(([k, v]) => [
        Number(k),
        v as DestinyCollectibleDefinition,
      ])
    ),
    plugSetsByHash: new Map(
      Object.entries(plugSetDefs).map(([k, v]) => [
        Number(k),
        v as DestinyPlugSetDefinition,
      ])
    ),
  };
}
