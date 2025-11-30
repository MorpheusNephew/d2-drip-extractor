import type { ArmorSlot } from "@/types/drip";

export function classTypeLabel(classType: number): string {
  switch (classType) {
    case 0:
      return "Titan";
    case 1:
      return "Hunter";
    case 2:
      return "Warlock";
    default:
      return "Unknown";
  }
}

export function slotLabel(slot: ArmorSlot): string {
  switch (slot) {
    case "helmet":
      return "Helmet";
    case "gauntlets":
      return "Gauntlets";
    case "chest":
      return "Chest";
    case "legs":
      return "Legs";
    case "classItem":
      return "Class Item";
    default:
      return "Unknown";
  }
}

export function getClassColor(classType: number): string {
  switch (classType) {
    case 0:
      return "bg-red-400";
    case 1:
      return "bg-blue-400";
    case 2:
      return "bg-purple-400";
    default:
      return "bg-gray-400";
  }
}

