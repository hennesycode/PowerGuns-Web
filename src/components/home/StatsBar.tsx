import { STATS } from "@/lib/constants";

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-[#111111] border-t border-[#c4871a]/25 border-b border-[#c4871a]/15">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative px-4 py-8 md:py-10 text-center ${
            i > 0 ? "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-14 before:w-px before:bg-[#c4871a]/18 hidden md:block" : ""
          }`}
        >
          <div className="font-heading font-black text-[46px] md:text-[56px] leading-none text-[#c4871a] tracking-[-.02em]">
            {stat.value}
            <span className="text-2xl text-[#d4a244]">{stat.suffix}</span>
          </div>
          <div className="font-['Rajdhani',sans-serif] font-medium text-[11px] tracking-[.22em] uppercase text-[#8a8a8a] mt-1.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
