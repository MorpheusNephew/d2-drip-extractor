export type DestinyClassName = "hunter" | "titan" | "warlock" | "unknown";

export type ArmorSlot =
  | "helmet"
  | "gauntlets"
  | "chest"
  | "legs"
  | "classItem"
  | "unknown";

export type OwnedShader = {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
};

export type OwnedArmorOrnament = {
  itemHash: number;
  name: string;
  icon: string;
  classType: number;
  isUniversal: boolean;
  slot: ArmorSlot;
  appliesToItemHashes: number[];
  appliesToItemNames: string[];
};

export type OrnamentsByClass = Record<DestinyClassName, OwnedArmorOrnament[]>;

export type OwnedArmorItem = {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
  classType: number;
  slot: ArmorSlot;
  tierType: number;
  isExotic: boolean;
};

export type OwnedArmorByClass = Record<DestinyClassName, OwnedArmorItem[]>;

export type CharacterArmorSlot = {
  slot: ArmorSlot;
  baseItemHash: number;
  baseItemName: string;
  icon: string;
  classType: number;
  tierType: number;
  isExotic: boolean;
  availableUniversalOrnaments: number[];
  availableArmorSpecificOrnaments: number[];
};

export type CharacterArmorDrip = {
  characterId: string;
  classType: number;
  armorSlots: CharacterArmorSlot[];
};

export type DripResponse = {
  shaders: OwnedShader[];
  universalOrnamentsByClass: OrnamentsByClass;
  wishlistUniversalOrnamentsByClass: OrnamentsByClass;
  armorSpecificOrnamentsByClass: OrnamentsByClass;
  ownedArmorByClass: OwnedArmorByClass;
  ownedExoticArmor: OwnedArmorItem[];
  characterArmorDrip: CharacterArmorDrip[];
};

