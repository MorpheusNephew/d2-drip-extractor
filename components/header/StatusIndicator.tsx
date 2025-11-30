interface StatusIndicatorProps {
  status: string;
  message: string;
}

export default function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const isAuthenticated = status === "authenticated";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-3 h-3 rounded-full ${
          isAuthenticated
            ? "bg-green-400 shadow-lg shadow-green-400/50"
            : "bg-gray-500"
        } animate-pulse`}
      ></div>
      <div className="flex flex-col">
        <span className="text-xs text-[#c5c5c5]/60 uppercase tracking-wider font-medium">
          Guardian Status
        </span>
        <span
          className={`text-sm font-semibold ${
            isAuthenticated ? "text-[#4a9eff]" : "text-gray-400"
          }`}
        >
          {message}
        </span>
      </div>
    </div>
  );
}

