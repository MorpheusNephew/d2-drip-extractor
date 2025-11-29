// lib/destiny/cosmetics.ts

import { DestinyCollectibleState, DestinyClass } from "bungie-api-ts/destiny2";
import type {
  BungieMembershipType,
  DestinyProfileResponse,
  DestinyInventoryItemDefinition,
} from "bungie-api-ts/destiny2";

import { loadManifestSlice, type ManifestSlice } from "./manifest";

import { bungieClient } from "@/lib/bungie";

// ---------------------------------------------------------------------------
// Types exposed by this module
// ---------------------------------------------------------------------------

export interface OwnedShader {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
}

export interface OwnedArmorOrnament {
  itemHash: number;
  name: string;
  icon: string;
  classType: DestinyClass;
  isUniversal: boolean; // true = transmog, false = armor-specific
  appliesToItemHashes: number[]; // base armor items this ornament can apply to
  appliesToItemNames: string[]; // human-readable armor names
}

export interface OrnamentsByClass {
  hunter: OwnedArmorOrnament[];
  titan: OwnedArmorOrnament[];
  warlock: OwnedArmorOrnament[];
  unknown: OwnedArmorOrnament[];
}

export interface OwnedCosmeticsResult {
  shaders: OwnedShader[];

  // Universal armor ornaments (transmog) that are already unlocked
  universalOrnamentsByClass: OrnamentsByClass;

  // Universal armor ornaments that exist in Collections but are NOT yet unlocked
  wishlistUniversalOrnamentsByClass: OrnamentsByClass;

  // Armor-specific ornaments that are unlocked (exotic / set-tied skins)
  armorSpecificOrnamentsByClass: OrnamentsByClass;
}

export interface OwnedCosmeticsConfig {
  accessToken: string;
  membershipType: BungieMembershipType | number;
  destinyMembershipId: string;
}

// ---------------------------------------------------------------------------
// Raw GetProfile call (no helper wrappers)
// ---------------------------------------------------------------------------

async function fetchProfileWithCosmetics(opts: {
  accessToken: string;
  membershipType: BungieMembershipType | number;
  destinyMembershipId: string;
}): Promise<DestinyProfileResponse> {
  const { accessToken, membershipType, destinyMembershipId } = opts;

  // Profiles + Collectibles is enough for ownership detection:
  // 100 = Profiles, 800 = Collectibles
  const components = "100,800";

  const path = `/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`;
  return bungieClient.get<DestinyProfileResponse>(path, accessToken, {
    components,
  });
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

function isShaderDef(item: DestinyInventoryItemDefinition): boolean {
  return (
    !!item.plug &&
    typeof item.itemTypeDisplayName === "string" &&
    item.itemTypeDisplayName.toLowerCase().includes("shader")
  );
}

function isArmorOrnamentDef(item: DestinyInventoryItemDefinition): boolean {
  return (
    !!item.plug &&
    typeof item.itemTypeDisplayName === "string" &&
    item.itemTypeDisplayName.toLowerCase().includes("ornament")
  );
}

/**
 * Universal armor ornament (Transmog) detection.
 *
 * Uses the standard wording Bungie uses for universal ornaments in the
 * item description (e.g. "Once you get a universal ornament..." and
 * "eligible Legendary armor").
 */
function isUniversalArmorOrnamentDef(
  item: DestinyInventoryItemDefinition
): boolean {
  if (!isArmorOrnamentDef(item)) return false;

  const desc = item.displayProperties?.description?.toLowerCase() ?? "";

  return (
    desc.includes("once you get a universal ornament") ||
    desc.includes("once you get the universal ornament") ||
    desc.includes("eligible legendary armor") ||
    desc.includes("eligible legendary")
  );
}

/**
 * Merge collectible states from profile + all characters.
 */
function mergeCollectibleStates(
  profile: DestinyProfileResponse
): Map<number, DestinyCollectibleState> {
  const stateByCollectible = new Map<number, DestinyCollectibleState>();

  const profileCollectibles =
    profile.profileCollectibles?.data?.collectibles ?? {};
  for (const [hashStr, comp] of Object.entries(profileCollectibles)) {
    const hash = Number(hashStr);
    // @ts-expect-error IsolatedModules
    const prev = stateByCollectible.get(hash) ?? DestinyCollectibleState.None;
    stateByCollectible.set(
      hash,
      (prev | comp.state) as DestinyCollectibleState
    );
  }

  const characterCollectibles = profile.characterCollectibles?.data ?? {};
  for (const [, charData] of Object.entries(characterCollectibles)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectibles = (charData as any).collectibles ?? {};
    for (const [hashStr, comp] of Object.entries(collectibles)) {
      const hash = Number(hashStr);
      // @ts-expect-error IsolatedModules
      const prev = stateByCollectible.get(hash) ?? DestinyCollectibleState.None;
      stateByCollectible.set(
        hash,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prev | (comp as any).state) as DestinyCollectibleState
      );
    }
  }

  return stateByCollectible;
}

function isCollectibleAcquired(state: DestinyCollectibleState): boolean {
  // @ts-expect-error IsolatedModules
  return (state & DestinyCollectibleState.NotAcquired) === 0;
}

/**
 * Build mapping from ornament itemHash -> set of base armor itemHashes,
 * by scanning sockets on all inventory items.
 */
function buildOrnamentToArmorMap(
  manifest: ManifestSlice
): Map<number, Set<number>> {
  const map = new Map<number, Set<number>>();

  for (const [itemHash, itemDef] of manifest.inventoryItemsByHash) {
    const sockets = itemDef.sockets?.socketEntries ?? [];
    if (!sockets.length) continue;

    const maybeName = itemDef.itemTypeDisplayName?.toLowerCase() ?? "";
    const isArmor =
      itemDef.itemType === 2 || // DestinyItemType.Armor
      maybeName.includes("helmet") ||
      maybeName.includes("gauntlet") ||
      maybeName.includes("greaves") ||
      maybeName.includes("robes") ||
      maybeName.includes("chest armor") ||
      maybeName.includes("cloak") ||
      maybeName.includes("bond") ||
      maybeName.includes("mark");

    if (!isArmor) continue;

    for (const socketEntry of sockets) {
      const reusablePlugItems = socketEntry.reusablePlugItems ?? [];
      for (const plug of reusablePlugItems) {
        const ornamentHash = plug.plugItemHash;
        if (ornamentHash == null) continue;

        let set = map.get(ornamentHash);
        if (!set) {
          set = new Set<number>();
          map.set(ornamentHash, set);
        }
        set.add(itemHash);
      }
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Main entry: loadOwnedCosmetics (with wishlist)
// ---------------------------------------------------------------------------

export async function loadOwnedCosmetics(
  config: OwnedCosmeticsConfig
): Promise<OwnedCosmeticsResult> {
  const { accessToken, membershipType, destinyMembershipId } = config;

  // 1) Manifest slice (inventory items + collectibles + plugsets)
  const manifest = await loadManifestSlice(accessToken);

  // 2) Ornament -> base armor mapping (used for both universal + specific)
  const ornamentToArmorMap = buildOrnamentToArmorMap(manifest);

  // 3) Profile with Collectibles component
  const profile = await fetchProfileWithCosmetics({
    accessToken,
    membershipType,
    destinyMembershipId,
  });

  // 4) Collectible states merged across profile+characters
  const stateByCollectible = mergeCollectibleStates(profile);

  // 5) Output containers
  const shaders: OwnedShader[] = [];

  const universalOrnamentsByClass: OrnamentsByClass = {
    hunter: [],
    titan: [],
    warlock: [],
    unknown: [],
  };

  const wishlistUniversalOrnamentsByClass: OrnamentsByClass = {
    hunter: [],
    titan: [],
    warlock: [],
    unknown: [],
  };

  const armorSpecificOrnamentsByClass: OrnamentsByClass = {
    hunter: [],
    titan: [],
    warlock: [],
    unknown: [],
  };

  // 6) Walk collectibles and classify
  for (const [collectibleHash, state] of stateByCollectible.entries()) {
    const collectibleDef = manifest.collectiblesByHash.get(collectibleHash);
    if (!collectibleDef) continue;

    const itemHash = collectibleDef.itemHash;
    const itemDef = manifest.inventoryItemsByHash.get(itemHash);
    if (!itemDef) continue;

    const acquired = isCollectibleAcquired(state);

    // (a) Shaders (only care about owned)
    if (isShaderDef(itemDef)) {
      if (!acquired) continue;

      shaders.push({
        itemHash,
        collectibleHash,
        name: itemDef.displayProperties?.name ?? "Unknown Shader",
        icon: itemDef.displayProperties?.icon ?? "",
      });
      continue;
    }

    // (b) Armor ornaments (universal and armor-specific)
    if (!isArmorOrnamentDef(itemDef)) continue;

    const classType: DestinyClass =
      typeof itemDef.classType === "number"
        ? itemDef.classType
        : // @ts-expect-error IsolatedModules
          DestinyClass.Unknown;

    const baseArmorHashes =
      ornamentToArmorMap.get(itemHash) ?? new Set<number>();
    const appliesToItemHashes = Array.from(baseArmorHashes);
    const appliesToItemNames = appliesToItemHashes
      .map((h) => manifest.inventoryItemsByHash.get(h))
      .filter((def): def is DestinyInventoryItemDefinition => !!def)
      .map((def) => def.displayProperties?.name ?? "Unknown Armor");

    const isUniversal = isUniversalArmorOrnamentDef(itemDef);

    const ornamentEntry: OwnedArmorOrnament = {
      itemHash,
      name: itemDef.displayProperties?.name ?? "Unknown Ornament",
      icon: itemDef.displayProperties?.icon ?? "",
      classType,
      isUniversal,
      appliesToItemHashes,
      appliesToItemNames,
    };

    const bucket =
      // @ts-expect-error IsolatedModules
      classType === DestinyClass.Hunter
        ? "hunter"
        : // @ts-expect-error IsolatedModules
        classType === DestinyClass.Titan
        ? "titan"
        : // @ts-expect-error IsolatedModules
        classType === DestinyClass.Warlock
        ? "warlock"
        : "unknown";

    if (isUniversal) {
      // Universal ornaments: split into owned vs wishlist
      if (acquired) {
        universalOrnamentsByClass[bucket].push(ornamentEntry);
      } else {
        wishlistUniversalOrnamentsByClass[bucket].push(ornamentEntry);
      }
    } else {
      // Armor-specific ornaments: only return owned ones (wishlist here is less useful)
      if (acquired) {
        armorSpecificOrnamentsByClass[bucket].push(ornamentEntry);
      }
    }
  }

  return {
    shaders,
    universalOrnamentsByClass,
    wishlistUniversalOrnamentsByClass,
    armorSpecificOrnamentsByClass,
  };
}
