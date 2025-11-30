export default function LoadingState() {
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

