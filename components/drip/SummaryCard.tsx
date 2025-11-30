interface SummaryCardProps {
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
  gradient?: boolean;
}

export default function SummaryCard({ 
  label, 
  value, 
  color, 
  subtitle,
  gradient = false 
}: SummaryCardProps) {
  const valueClass = gradient
    ? "text-3xl font-bold bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-transparent"
    : "text-3xl font-bold bg-gradient-to-br from-white to-[#c5c5c5] bg-clip-text text-transparent";

  return (
    <div className={`group rounded-xl bg-gradient-to-br from-${color}/10 to-transparent border border-${color}/20 p-4 hover:border-${color}/40 transition-all duration-300 hover:shadow-lg hover:shadow-${color}/10`}>
      <div className="text-[#c5c5c5]/70 uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className={valueClass}>{value}</div>
      {subtitle && (
        <div className={`text-[10px] text-${color}/70 mt-1`}>{subtitle}</div>
      )}
    </div>
  );
}

