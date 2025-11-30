import type { DripResponse, DestinyClassName } from "@/types/drip";
import SummaryCard from "./SummaryCard";

interface ArsenalSummaryProps {
  data: DripResponse;
}

export default function ArsenalSummary({ data }: ArsenalSummaryProps) {
  const classes: DestinyClassName[] = ["hunter", "titan", "warlock", "unknown"];

  const countUniversalOwned = classes.reduce(
    (sum, c) => sum + data.universalOrnamentsByClass[c].length,
    0
  );
  const countUniversalWishlist = classes.reduce(
    (sum, c) => sum + data.wishlistUniversalOrnamentsByClass[c].length,
    0
  );
  const countArmorSpecific = classes.reduce(
    (sum, c) => sum + data.armorSpecificOrnamentsByClass[c].length,
    0
  );
  const countArmorOwned = classes.reduce(
    (sum, c) => sum + data.ownedArmorByClass[c].length,
    0
  );
  const countExotics = data.ownedExoticArmor.length;
  const countCharacters = data.characterArmorDrip.length;

  return (
    <section className="rounded-2xl border border-[#4a9eff]/20 bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/60 backdrop-blur-sm p-6 shadow-2xl shadow-[#4a9eff]/5">
      <h3 className="text-base font-bold text-[#4a9eff] mb-5 uppercase tracking-wide flex items-center gap-2">
        <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
        Arsenal Summary
      </h3>
      <div className="grid gap-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <SummaryCard 
          label="Shaders" 
          value={data.shaders.length} 
          color="[#4a9eff]" 
        />
        <SummaryCard 
          label="Universal Ornaments" 
          value={countUniversalOwned} 
          color="[#00d4ff]" 
          subtitle="Owned"
        />
        <SummaryCard 
          label="Wishlist Ornaments" 
          value={countUniversalWishlist} 
          color="[#8b5cf6]" 
          subtitle="Universal"
        />
        <SummaryCard 
          label="Armor Ornaments" 
          value={countArmorSpecific} 
          color="[#f4d03f]" 
          subtitle="Armor-Specific"
        />
        <SummaryCard 
          label="Armor Pieces" 
          value={countArmorOwned} 
          color="emerald-400" 
          subtitle="Legendary + Exotic"
        />
        <SummaryCard 
          label="Exotic Armor" 
          value={countExotics} 
          color="amber-400" 
          subtitle="Pieces"
          gradient
        />
        <SummaryCard 
          label="Active Guardians" 
          value={countCharacters} 
          color="rose-400" 
          subtitle="Characters"
        />
      </div>
    </section>
  );
}

