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
    return <p className="text-sm text-zinc-300">Loading your drip data…</p>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/50 bg-red-950/30 p-4 text-sm text-red-200">
        <p className="font-semibold mb-1">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300">
        No data returned from <code className="text-xs">/api/drip</code>.
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
    <div className="w-full max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Drip JSON</h1>
        <p className="text-sm text-zinc-400">
          This is the full cosmetic dataset from <code>/api/drip</code>{" "}
          including shaders, ornaments, armor, and per-character equipped slots.
        </p>
      </header>

      {/* Summary */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Summary</h2>
        <div className="grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">Shaders</div>
            <div className="text-lg font-semibold text-zinc-100">
              {data.shaders.length}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">Universal Ornaments (owned)</div>
            <div className="text-lg font-semibold text-zinc-100">
              {countUniversalOwned}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">Universal Ornaments (wishlist)</div>
            <div className="text-lg font-semibold text-zinc-100">
              {countUniversalWishlist}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">
              Armor-specific Ornaments (owned)
            </div>
            <div className="text-lg font-semibold text-zinc-100">
              {countArmorSpecific}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">
              Armor Pieces (Legendary + Exotic)
            </div>
            <div className="text-lg font-semibold text-zinc-100">
              {countArmorOwned}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">Exotic Armor</div>
            <div className="text-lg font-semibold text-zinc-100">
              {countExotics}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900/80 p-3">
            <div className="text-zinc-400">Characters with Drip Data</div>
            <div className="text-lg font-semibold text-zinc-100">
              {countCharacters}
            </div>
          </div>
        </div>
      </section>

      {/* Equipped Armor per Character */}
      {data.characterArmorDrip.length > 0 && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">
            Equipped Armor per Character
          </h2>
          <div className="space-y-4 text-xs">
            {data.characterArmorDrip.map((char) => (
              <div
                key={char.characterId}
                className="rounded-lg bg-zinc-900/80 p-3 border border-zinc-800/80"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-zinc-100">
                    {classTypeLabel(char.classType)} –{" "}
                    <span className="text-zinc-400 text-[10px]">
                      Character ID: {char.characterId}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {char.armorSlots.length} armor slots
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {char.armorSlots.map((slot) => (
                    <div
                      key={`${char.characterId}-${slot.slot}`}
                      className="rounded-md bg-black/40 p-2 border border-zinc-800/60 flex flex-col gap-1"
                    >
                      <div className="flex items-center gap-2">
                        {slot.icon && (
                          <img
                            src={`https://www.bungie.net${slot.icon}`}
                            alt={slot.baseItemName}
                            className="w-8 h-8 rounded-sm"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold text-zinc-100">
                            {slotLabel(slot.slot)}
                          </div>
                          <div className="text-[11px] text-zinc-300 truncate">
                            {slot.baseItemName}
                          </div>
                          {slot.isExotic && (
                            <div className="text-[10px] text-amber-300 uppercase tracking-wide mt-0.5">
                              Exotic
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        <div>
                          Universal ornaments:{" "}
                          <span className="text-zinc-100">
                            {slot.availableUniversalOrnaments.length}
                          </span>
                        </div>
                        <div>
                          Armor-specific ornaments:{" "}
                          <span className="text-zinc-100">
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
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">JSON Preview</h2>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 active:scale-[0.99]"
          >
            {downloadStatus ?? "Download JSON"}
          </button>
        </div>
        <div className="relative">
          <pre className="max-h-[480px] overflow-auto rounded-lg border border-zinc-800 bg-black/80 p-3 text-xs text-zinc-200">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}
