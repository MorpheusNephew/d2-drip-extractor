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

export type ArmorSlot =
  | "helmet"
  | "gauntlets"
  | "chest"
  | "legs"
  | "classItem"
  | "unknown";

export interface OwnedArmorOrnament {
  itemHash: number;
  name: string;
  icon: string;
  classType: DestinyClass;
  isUniversal: boolean; // true = transmog, false = armor-specific
  slot: ArmorSlot;
  appliesToItemHashes: number[]; // base armor items this ornament can apply to
  appliesToItemNames: string[]; // human-readable armor names
}

export interface OrnamentsByClass {
  hunter: OwnedArmorOrnament[];
  titan: OwnedArmorOrnament[];
  warlock: OwnedArmorOrnament[];
  unknown: OwnedArmorOrnament[];
}

export interface OwnedArmorItem {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
  classType: DestinyClass;
  slot: ArmorSlot;
  tierType: number; // 1-6 (6 = Exotic)
  isExotic: boolean;
}

export interface OwnedArmorByClass {
  hunter: OwnedArmorItem[];
  titan: OwnedArmorItem[];
  warlock: OwnedArmorItem[];
  unknown: OwnedArmorItem[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OwnedExoticArmor extends OwnedArmorItem {}

export interface CharacterArmorSlot {
  slot: ArmorSlot;
  baseItemHash: number;
  baseItemName: string;
  icon: string;
  classType: DestinyClass;
  tierType: number;
  isExotic: boolean;

  // Ornaments available for this specific slot/item:
  availableUniversalOrnaments: number[]; // itemHashes
  availableArmorSpecificOrnaments: number[]; // itemHashes
}

export interface CharacterArmorDrip {
  characterId: string;
  classType: DestinyClass;
  armorSlots: CharacterArmorSlot[];
}

export interface OwnedCosmeticsResult {
  shaders: OwnedShader[];

  // Universal armor ornaments (transmog) that are already unlocked
  universalOrnamentsByClass: OrnamentsByClass;

  // Universal armor ornaments that exist in Collections but are NOT yet unlocked
  wishlistUniversalOrnamentsByClass: OrnamentsByClass;

  // Armor-specific ornaments that are unlocked (exotic / set-tied skins)
  armorSpecificOrnamentsByClass: OrnamentsByClass;

  // All Legendary + Exotic armor unlocked in Collections
  ownedArmorByClass: OwnedArmorByClass;

  // All Exotic armor (subset of ownedArmorByClass)
  ownedExoticArmor: OwnedExoticArmor[];

  // Equipped armor per character, with per-slot ornament availability
  characterArmorDrip: CharacterArmorDrip[];
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

  // Components:
  // 100 = Profiles
  // 102 = ProfileInventories (vault)
  // 200 = Characters
  // 201 = CharacterInventories
  // 205 = CharacterEquipment
  // 305 = ItemSockets
  // 310 = ItemReusablePlugs
  // 800 = Collectibles
  // 1000 = ProfilePlugSets
  // 1001 = CharacterPlugSets
  const components = "100,102,200,201,205,305,310,800,1000,1001";

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
 * Uses the standard wording Bungie uses for universal ornaments.
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
 * Is this an armor item (not an ornament, not a weapon).
 */
function isArmorDef(item: DestinyInventoryItemDefinition): boolean {
  if (item.itemType === 2) return true; // DestinyItemType.Armor

  const name = item.itemTypeDisplayName?.toLowerCase() ?? "";
  return (
    name.includes("helmet") ||
    name.includes("helm") ||
    name.includes("hood") ||
    name.includes("cowl") ||
    name.includes("mask") ||
    name.includes("gauntlet") ||
    name.includes("gloves") ||
    name.includes("grips") ||
    name.includes("vambraces") ||
    name.includes("arms") ||
    name.includes("chest") ||
    name.includes("plate") ||
    name.includes("vest") ||
    name.includes("robe") ||
    name.includes("coat") ||
    name.includes("legs") ||
    name.includes("greaves") ||
    name.includes("boots") ||
    name.includes("strides") ||
    name.includes("pants") ||
    name.includes("slacks") ||
    name.includes("bond") ||
    name.includes("mark") ||
    name.includes("cloak")
  );
}

/**
 * Roughly infer armor slot from type display name.
 * You can refine using bucketTypeHash if you later load BucketDefinitions.
 */
function getArmorSlotFromName(item: DestinyInventoryItemDefinition): ArmorSlot {
  const name = item.itemTypeDisplayName?.toLowerCase() ?? "";

  if (
    name.includes("helmet") ||
    name.includes("helm") ||
    name.includes("hood") ||
    name.includes("mask") ||
    name.includes("cowl")
  ) {
    return "helmet";
  }

  if (
    name.includes("gauntlet") ||
    name.includes("gloves") ||
    name.includes("grips") ||
    name.includes("vambrace") ||
    name.includes("arms")
  ) {
    return "gauntlets";
  }

  if (
    name.includes("chest") ||
    name.includes("plate") ||
    name.includes("vest") ||
    name.includes("robe") ||
    name.includes("coat") ||
    name.includes("cuirass")
  ) {
    return "chest";
  }

  if (
    name.includes("legs") ||
    name.includes("greaves") ||
    name.includes("boots") ||
    name.includes("strides") ||
    name.includes("pants") ||
    name.includes("slacks")
  ) {
    return "legs";
  }

  if (
    name.includes("bond") ||
    name.includes("mark") ||
    name.includes("cloak")
  ) {
    return "classItem";
  }

  return "unknown";
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
      itemDef.itemType === 2 ||
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

// Helper to map DestinyClass to our class-key
function classKey(
  classType: DestinyClass
): keyof OrnamentsByClass & keyof OwnedArmorByClass {
  switch (classType) {
    // @ts-expect-error IsolatedModules
    case DestinyClass.Titan:
      return "titan";
    // @ts-expect-error IsolatedModules
    case DestinyClass.Hunter:
      return "hunter";
    // @ts-expect-error IsolatedModules
    case DestinyClass.Warlock:
      return "warlock";
    default:
      return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Main entry: loadOwnedCosmetics (Option D-Plus)
// ---------------------------------------------------------------------------

export async function loadOwnedCosmetics(
  config: OwnedCosmeticsConfig
): Promise<OwnedCosmeticsResult> {
  const { accessToken, membershipType, destinyMembershipId } = config;

  // 1) Manifest slice (inventory items + collectibles + plugsets)
  const manifest = await loadManifestSlice(accessToken);

  // 2) Ornament -> base armor mapping (used for armor-specific ornaments)
  const ornamentToArmorMap = buildOrnamentToArmorMap(manifest);

  // 3) Profile with Collectibles + character data
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

  const ownedArmorByClass: OwnedArmorByClass = {
    hunter: [],
    titan: [],
    warlock: [],
    unknown: [],
  };

  const ownedExoticArmor: OwnedExoticArmor[] = [];

  // Indexes for per-slot ornament availability:
  // universalByClassAndSlot[classType][slot] = itemHashes[]
  const universalByClassAndSlot: Record<
    DestinyClass,
    Record<ArmorSlot, number[]>
  > = {
    // @ts-expect-error IsolatedModules
    [DestinyClass.Titan]: {
      helmet: [],
      gauntlets: [],
      chest: [],
      legs: [],
      classItem: [],
      unknown: [],
    },
    // @ts-expect-error IsolatedModules
    [DestinyClass.Hunter]: {
      helmet: [],
      gauntlets: [],
      chest: [],
      legs: [],
      classItem: [],
      unknown: [],
    },
    // @ts-expect-error IsolatedModules
    [DestinyClass.Warlock]: {
      helmet: [],
      gauntlets: [],
      chest: [],
      legs: [],
      classItem: [],
      unknown: [],
    },
    // @ts-expect-error IsolatedModules
    [DestinyClass.Unknown]: {
      helmet: [],
      gauntlets: [],
      chest: [],
      legs: [],
      classItem: [],
      unknown: [],
    },
  };

  // armorSpecificByBaseArmorHash[baseArmorHash] = ornament itemHashes[]
  const armorSpecificByBaseArmorHash = new Map<number, number[]>();

  // 6) Walk collectibles and classify
  for (const [collectibleHash, state] of stateByCollectible.entries()) {
    const collectibleDef = manifest.collectiblesByHash.get(collectibleHash);
    if (!collectibleDef) continue;

    const itemHash = collectibleDef.itemHash;
    const itemDef = manifest.inventoryItemsByHash.get(itemHash);
    if (!itemDef) continue;

    const acquired = isCollectibleAcquired(state);

    // (a) Exotic / Legendary armor in Collections
    if (acquired && isArmorDef(itemDef)) {
      const tierType = itemDef.inventory?.tierType ?? 0;
      // 5 = Legendary, 6 = Exotic
      if (tierType >= 5) {
        const classType: DestinyClass =
          typeof itemDef.classType === "number"
            ? itemDef.classType
            : // @ts-expect-error IsolatedModules
              DestinyClass.Unknown;
        const slot = getArmorSlotFromName(itemDef);
        const key = classKey(classType);

        const armorEntry: OwnedArmorItem = {
          itemHash,
          collectibleHash,
          name: itemDef.displayProperties?.name ?? "Unknown Armor",
          icon: itemDef.displayProperties?.icon ?? "",
          classType,
          slot,
          tierType,
          isExotic: tierType === 6,
        };

        ownedArmorByClass[key].push(armorEntry);
        if (armorEntry.isExotic) {
          ownedExoticArmor.push(armorEntry);
        }
      }
    }

    // (b) Shaders (only care about owned)
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

    // (c) Armor ornaments (universal and armor-specific)
    if (!isArmorOrnamentDef(itemDef)) continue;

    const classType: DestinyClass =
      typeof itemDef.classType === "number"
        ? itemDef.classType
        : // @ts-expect-error IsolatedModules
          DestinyClass.Unknown;

    const slot = getArmorSlotFromName(itemDef);

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
      slot,
      appliesToItemHashes,
      appliesToItemNames,
    };

    const key = classKey(classType);

    if (isUniversal) {
      // Index for per-slot availability
      // Unknown classType ornaments we treat as available to all classes
      const targetClasses: DestinyClass[] =
        // @ts-expect-error IsolatedModules
        classType === DestinyClass.Unknown
          ? // @ts-expect-error IsolatedModules
            [DestinyClass.Hunter, DestinyClass.Titan, DestinyClass.Warlock]
          : [classType];

      for (const ct of targetClasses) {
        universalByClassAndSlot[ct][slot].push(itemHash);
      }

      // Owned vs wishlist
      if (acquired) {
        universalOrnamentsByClass[key].push(ornamentEntry);
      } else {
        wishlistUniversalOrnamentsByClass[key].push(ornamentEntry);
      }
    } else {
      // Armor-specific ornaments: only return owned ones
      if (acquired) {
        armorSpecificOrnamentsByClass[key].push(ornamentEntry);

        // Build base armor -> ornament mapping for per-slot availability
        for (const armorHash of appliesToItemHashes) {
          const list = armorSpecificByBaseArmorHash.get(armorHash) ?? [];
          list.push(itemHash);
          armorSpecificByBaseArmorHash.set(armorHash, list);
        }
      }
    }
  }

  // 7) Build per-character armor drip (equipped armor + per-slot ornament availability)
  const characterArmorDrip: CharacterArmorDrip[] = [];
  const characterEquipment = profile.characterEquipment?.data ?? {};
  const characterData = profile.characters?.data ?? {};

  for (const [characterId, charData] of Object.entries(characterData)) {
    const classType = charData.classType as DestinyClass;
    const equippedItems = characterEquipment[characterId]?.items ?? [];

    const slotMap = new Map<ArmorSlot, CharacterArmorSlot>();

    for (const item of equippedItems) {
      const itemDef = manifest.inventoryItemsByHash.get(item.itemHash);
      if (!itemDef) continue;
      if (!isArmorDef(itemDef)) continue;

      const slot = getArmorSlotFromName(itemDef);
      if (slot === "unknown") continue;

      const tierType = itemDef.inventory?.tierType ?? 0;
      const isExotic = tierType === 6;

      const baseSlot: CharacterArmorSlot = {
        slot,
        baseItemHash: item.itemHash,
        baseItemName: itemDef.displayProperties?.name ?? "Unknown Armor",
        icon: itemDef.displayProperties?.icon ?? "",
        classType,
        tierType,
        isExotic,
        availableUniversalOrnaments: [],
        availableArmorSpecificOrnaments: [],
      };

      slotMap.set(slot, baseSlot);
    }

    // Now attach ornament availability per slot
    for (const [slot, entry] of slotMap.entries()) {
      // Universal: from classType + slot index
      entry.availableUniversalOrnaments =
        universalByClassAndSlot[classType]?.[slot] ?? [];

      // Armor-specific: from base armor hash mapping
      entry.availableArmorSpecificOrnaments =
        armorSpecificByBaseArmorHash.get(entry.baseItemHash) ?? [];
    }

    characterArmorDrip.push({
      characterId,
      classType,
      armorSlots: Array.from(slotMap.values()),
    });
  }

  return {
    shaders,
    universalOrnamentsByClass,
    wishlistUniversalOrnamentsByClass,
    armorSpecificOrnamentsByClass,
    ownedArmorByClass,
    ownedExoticArmor,
    characterArmorDrip,
  };
}
