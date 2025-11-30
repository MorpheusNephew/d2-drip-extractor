interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-red-900/20 backdrop-blur-sm p-6 text-sm shadow-lg shadow-red-500/10">
      <p className="font-bold mb-2 text-red-300 text-base">⚠️ Error</p>
      <p className="text-red-200/90">{error}</p>
    </div>
  );
}

