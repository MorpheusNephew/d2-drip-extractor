import type { CharacterArmorDrip } from "@/types/drip";
import CharacterLoadout from "./CharacterLoadout";

interface CurrentLoadoutsProps {
  characters: CharacterArmorDrip[];
}

export default function CurrentLoadouts({ characters }: CurrentLoadoutsProps) {
  if (characters.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#4a9eff]/20 bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/60 backdrop-blur-sm p-6 shadow-2xl shadow-[#4a9eff]/5">
      <h3 className="text-base font-bold text-[#4a9eff] mb-5 uppercase tracking-wide flex items-center gap-2">
        <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
        Current Loadouts
      </h3>
      <div className="space-y-5 text-xs">
        {characters.map((char) => (
          <CharacterLoadout key={char.characterId} character={char} />
        ))}
      </div>
    </section>
  );
}

