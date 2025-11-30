import type { DripResponse } from "@/types/drip";
import ArsenalSummary from "./ArsenalSummary";
import CurrentLoadouts from "./CurrentLoadouts";
import DataExport from "./DataExport";

interface DripManifestProps {
  data: DripResponse;
}

export default function DripManifest({ data }: DripManifestProps) {
  return (
    <div className="w-full space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4a9eff] to-[#00d4ff] bg-clip-text text-transparent">
          Cosmetic Manifest
        </h2>
        <p className="text-sm text-[#c5c5c5]/80">
          Complete dataset including shaders, ornaments, armor, and equipped loadouts
        </p>
      </header>

      <ArsenalSummary data={data} />
      <CurrentLoadouts characters={data.characterArmorDrip} />
      <DataExport data={data} />
    </div>
  );
}

