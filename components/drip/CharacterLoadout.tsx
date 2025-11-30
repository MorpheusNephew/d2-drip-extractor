import type { CharacterArmorDrip } from "@/types/drip";
import { classTypeLabel, getClassColor } from "@/lib/utils/destiny";
import ArmorSlotCard from "./ArmorSlotCard";

interface CharacterLoadoutProps {
  character: CharacterArmorDrip;
}

export default function CharacterLoadout({ character }: CharacterLoadoutProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-[#0a0e1a]/60 to-black/40 p-5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-300 shadow-lg hover:shadow-[#00d4ff]/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${getClassColor(character.classType)} shadow-lg`}
          ></div>
          <div>
            <div className="font-bold text-base bg-gradient-to-r from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {classTypeLabel(character.classType)}
            </div>
            <div className="text-[10px] text-[#c5c5c5]/50 font-mono">
              ID: {character.characterId}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-[#c5c5c5]/60 px-3 py-1.5 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/20">
          {character.armorSlots.length} slots
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {character.armorSlots.map((slot) => (
          <ArmorSlotCard
            key={`${character.characterId}-${slot.slot}`}
            slot={slot}
            characterId={character.characterId}
          />
        ))}
      </div>
    </div>
  );
}

