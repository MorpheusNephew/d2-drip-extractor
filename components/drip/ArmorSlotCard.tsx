import type { CharacterArmorSlot } from "@/types/drip";
import { slotLabel } from "@/lib/utils/destiny";

interface ArmorSlotCardProps {
  slot: CharacterArmorSlot;
  characterId: string;
}

export default function ArmorSlotCard({ slot, characterId }: ArmorSlotCardProps) {
  return (
    <div
      key={`${characterId}-${slot.slot}`}
      className={`group rounded-lg bg-black/60 p-3 border ${
        slot.isExotic
          ? "border-amber-400/40 bg-gradient-to-br from-amber-400/5 to-transparent"
          : "border-[#4a9eff]/20"
      } flex flex-col gap-2 hover:border-[#4a9eff]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#4a9eff]/10`}
    >
      <div className="flex items-start gap-2">
        {slot.icon && (
          <div className="relative">
            <img
              src={`https://www.bungie.net${slot.icon}`}
              alt={slot.baseItemName}
              className="w-10 h-10 rounded-md border border-[#4a9eff]/30 group-hover:border-[#4a9eff]/60 transition-colors"
            />
            {slot.isExotic && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-black animate-pulse"></div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-[#c5c5c5]/60 uppercase tracking-wider">
            {slotLabel(slot.slot)}
          </div>
          <div className="text-[11px] text-white font-medium truncate leading-tight mt-0.5">
            {slot.baseItemName}
          </div>
          {slot.isExotic && (
            <div className="inline-block text-[9px] text-amber-400 uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
              Exotic
            </div>
          )}
        </div>
      </div>
      <div className="text-[10px] text-[#c5c5c5]/60 space-y-1 pt-2 border-t border-[#4a9eff]/10">
        <div className="flex justify-between">
          <span>Universal:</span>
          <span className="text-[#4a9eff] font-semibold">
            {slot.availableUniversalOrnaments.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Specific:</span>
          <span className="text-[#00d4ff] font-semibold">
            {slot.availableArmorSpecificOrnaments.length}
          </span>
        </div>
      </div>
    </div>
  );
}

