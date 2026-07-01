interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
}: DashboardCardProps) {
  return (
    <div className="bg-[#171513] border border-[#c4871a]/12 p-6 relative overflow-hidden group transition-all duration-300 hover:bg-[#26231F] hover:border-[#c4871a]/25">
      {/* Left hover line */}
      <span className="absolute top-0 left-0 w-[2px] h-0 bg-[#c4871a] transition-all duration-400 group-hover:h-full" />

      <div className="flex items-start justify-between relative">
        <div className="space-y-1">
          <div className="font-['Rajdhani',sans-serif] font-semibold text-[11px] tracking-[.22em] uppercase text-[#B2AAA7]">
            {title}
          </div>
          <div className="font-heading font-black text-3xl md:text-4xl text-white leading-none">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-[#5B5A59]">{subtitle}</div>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-['Rajdhani',sans-serif] font-semibold tracking-[.06em] mt-1 ${
                trendUp ? "text-green-500" : "text-[#B63A2B]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-3 h-3"
              >
                {trendUp ? (
                  <polyline points="18 15 12 9 6 15" />
                ) : (
                  <polyline points="6 9 12 15 18 9" />
                )}
              </svg>
              {trend}
            </div>
          )}
        </div>
        <div className="text-[#c4871a]/40 group-hover:text-[#c4871a]/60 transition-colors duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
