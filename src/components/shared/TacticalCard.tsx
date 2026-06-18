import { cn } from "@/lib/utils";

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TacticalCard({ children, className }: TacticalCardProps) {
  return (
    <div
      className={cn(
        "bg-[#191919] border border-[#c4871a]/8 p-6 md:p-10 relative overflow-hidden transition-all duration-300 hover:bg-[#222222] hover:border-[#c4871a]/20 group",
        className
      )}
    >
      <span className="absolute top-0 left-0 w-[2px] h-0 bg-[#c4871a] transition-all duration-400 group-hover:h-full" />
      {children}
    </div>
  );
}
