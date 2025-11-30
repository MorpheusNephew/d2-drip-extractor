"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type DestinyClassName = "hunter" | "titan" | "warlock" | "unknown";

type ArmorSlot =
  | "helmet"
  | "gauntlets"
  | "chest"
  | "legs"
  | "classItem"
  | "unknown";

type OwnedShader = {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
};

type OwnedArmorOrnament = {
  itemHash: number;
  name: string;
  icon: string;
  classType: number;
  isUniversal: boolean;
  slot: ArmorSlot;
  appliesToItemHashes: number[];
  appliesToItemNames: string[];
};

type OrnamentsByClass = Record<DestinyClassName, OwnedArmorOrnament[]>;

type OwnedArmorItem = {
  itemHash: number;
  collectibleHash: number;
  name: string;
  icon: string;
  classType: number;
  slot: ArmorSlot;
  tierType: number;
  isExotic: boolean;
};

type OwnedArmorByClass = Record<DestinyClassName, OwnedArmorItem[]>;

type CharacterArmorSlot = {
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

type CharacterArmorDrip = {
  characterId: string;
  classType: number;
  armorSlots: CharacterArmorSlot[];
};

type DripResponse = {
  shaders: OwnedShader[];
  universalOrnamentsByClass: OrnamentsByClass;
  wishlistUniversalOrnamentsByClass: OrnamentsByClass;
  armorSpecificOrnamentsByClass: OrnamentsByClass;
  ownedArmorByClass: OwnedArmorByClass;
  ownedExoticArmor: OwnedArmorItem[];
  characterArmorDrip: CharacterArmorDrip[];
};

function classTypeLabel(classType: number): string {
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

function slotLabel(slot: ArmorSlot): string {
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

export default function DripClient() {
  const { data: session } = useSession();
  const [data, setData] = useState<DripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/drip");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed: ${res.status}`);
        }
        const json = (await res.json()) as DripResponse;
        setData(json);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDownload = () => {
    if (!data) return;

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "drip-cosmetics.json";
    a.click();

    URL.revokeObjectURL(url);

    setDownloadStatus("Downloaded!");
    setTimeout(() => setDownloadStatus(null), 1500);
  };

  if (!session) {
    return <></>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#4a9eff]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#4a9eff] border-r-[#00d4ff] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-[#c5c5c5] font-medium">Scanning Guardian cosmetics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-red-900/20 backdrop-blur-sm p-6 text-sm shadow-lg shadow-red-500/10">
        <p className="font-bold mb-2 text-red-300 text-base">⚠️ Error</p>
        <p className="text-red-200/90">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-[#4a9eff]/20 bg-[#0a0e1a]/60 backdrop-blur-sm p-6 text-sm shadow-lg">
        <p className="text-[#c5c5c5]">No data returned from <code className="text-xs px-2 py-1 bg-black/40 rounded text-[#4a9eff]">/api/drip</code>.</p>
      </div>
    );
  }

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
    <div className="w-full space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#4a9eff] to-[#00d4ff] bg-clip-text text-transparent">
          Cosmetic Manifest
        </h2>
        <p className="text-sm text-[#c5c5c5]/80">
          Complete dataset including shaders, ornaments, armor, and equipped loadouts
        </p>
      </header>

      {/* Summary */}
      <section className="rounded-2xl border border-[#4a9eff]/20 bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/60 backdrop-blur-sm p-6 shadow-2xl shadow-[#4a9eff]/5">
        <h3 className="text-base font-bold text-[#4a9eff] mb-5 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
          Arsenal Summary
        </h3>
        <div className="grid gap-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="group rounded-xl bg-gradient-to-br from-[#4a9eff]/10 to-transparent border border-[#4a9eff]/20 p-4 hover:border-[#4a9eff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#4a9eff]/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Shaders</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {data.shaders.length}
            </div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-[#00d4ff]/10 to-transparent border border-[#00d4ff]/20 p-4 hover:border-[#00d4ff]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00d4ff]/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Universal Ornaments</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {countUniversalOwned}
            </div>
            <div className="text-[10px] text-[#00d4ff]/70 mt-1">Owned</div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/20 p-4 hover:border-[#8b5cf6]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5cf6]/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Wishlist Ornaments</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {countUniversalWishlist}
            </div>
            <div className="text-[10px] text-[#8b5cf6]/70 mt-1">Universal</div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-[#f4d03f]/10 to-transparent border border-[#f4d03f]/20 p-4 hover:border-[#f4d03f]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#f4d03f]/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Armor Ornaments</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {countArmorSpecific}
            </div>
            <div className="text-[10px] text-[#f4d03f]/70 mt-1">Armor-Specific</div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-emerald-400/10 to-transparent border border-emerald-400/20 p-4 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Armor Pieces</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {countArmorOwned}
            </div>
            <div className="text-[10px] text-emerald-400/70 mt-1">Legendary + Exotic</div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-amber-400/10 to-transparent border border-amber-400/20 p-4 hover:border-amber-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Exotic Armor</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {countExotics}
            </div>
            <div className="text-[10px] text-amber-400/70 mt-1">Pieces</div>
          </div>

          <div className="group rounded-xl bg-gradient-to-br from-rose-400/10 to-transparent border border-rose-400/20 p-4 hover:border-rose-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-rose-400/10">
            <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">Active Guardians</div>
            <div className="text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent">
              {countCharacters}
            </div>
            <div className="text-[10px] text-rose-400/70 mt-1">Characters</div>
          </div>
        </div>
      </section>

      {/* Equipped Armor per Character */}
      {data.characterArmorDrip.length > 0 && (
        <section className="rounded-2xl border border-[#4a9eff]/20 bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/60 backdrop-blur-sm p-6 shadow-2xl shadow-[#4a9eff]/5">
          <h3 className="text-base font-bold text-[#4a9eff] mb-5 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
            Current Loadouts
          </h3>
          <div className="space-y-5 text-xs">
            {data.characterArmorDrip.map((char) => (
              <div
                key={char.characterId}
                className="rounded-xl bg-gradient-to-br from-[#0a0e1a]/60 to-black/40 p-5 border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 transition-all duration-300 shadow-lg hover:shadow-[#00d4ff]/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${char.classType === 0 ? "bg-red-400" : char.classType === 1 ? "bg-blue-400" : "bg-purple-400"} shadow-lg`}></div>
                    <div>
                      <div className="font-bold text-base bg-gradient-to-r from-white to-[#c5c5c5] bg-clip-text text-transparent">
                        {classTypeLabel(char.classType)}
                      </div>
                      <div className="text-[10px] text-[#c5c5c5]/50 font-mono">
                        ID: {char.characterId}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#c5c5c5]/60 px-3 py-1.5 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/20">
                    {char.armorSlots.length} slots
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {char.armorSlots.map((slot) => (
                    <div
                      key={`${char.characterId}-${slot.slot}`}
                      className={`group rounded-lg bg-black/60 p-3 border ${slot.isExotic ? "border-amber-400/40 bg-gradient-to-br from-amber-400/5 to-transparent" : "border-[#4a9eff]/20"} flex flex-col gap-2 hover:border-[#4a9eff]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#4a9eff]/10`}
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* JSON + Download */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#4a9eff] uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-[#4a9eff] to-[#00d4ff] rounded-full"></span>
              Raw Data Export
            </h3>
            <p className="text-xs text-[#c5c5c5]/60 mt-1">Complete JSON manifest for AI processing</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-[#00d4ff]/30 bg-gradient-to-r from-[#4a9eff]/20 to-[#00d4ff]/20 hover:from-[#4a9eff]/30 hover:to-[#00d4ff]/30 px-5 py-2.5 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#4a9eff]/10 hover:shadow-[#4a9eff]/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloadStatus ?? "Download JSON"}
          </button>
        </div>
        <div className="relative rounded-2xl border border-[#4a9eff]/20 bg-black/60 backdrop-blur-sm overflow-hidden shadow-2xl shadow-[#4a9eff]/5">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-[#4a9eff]/10 via-[#00d4ff]/10 to-[#8b5cf6]/10 border-b border-[#4a9eff]/20 flex items-center px-4 gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400/60"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400/60"></div>
            <div className="w-2 h-2 rounded-full bg-green-400/60"></div>
            <span className="text-[10px] text-[#c5c5c5]/60 ml-2 font-mono">drip-cosmetics.json</span>
          </div>
          <pre className="max-h-[480px] overflow-auto p-6 pt-12 text-xs text-[#c5c5c5] font-mono leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
