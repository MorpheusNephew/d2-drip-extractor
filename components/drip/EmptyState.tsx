export default function EmptyState() {
  return (
    <div className="rounded-xl border border-[#4a9eff]/20 bg-[#0a0e1a]/60 backdrop-blur-sm p-6 text-sm shadow-lg">
      <p className="text-[#c5c5c5]">
        No data returned from{" "}
        <code className="text-xs px-2 py-1 bg-black/40 rounded text-[#4a9eff]">/api/drip</code>.
      </p>
    </div>
  );
}

