import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string | React.ReactNode;
  description?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-14 md:mb-16", className)}>
      <div className="flex items-center gap-3 mb-2.5 font-['Rajdhani',sans-serif] font-bold text-[11px] tracking-[.35em] uppercase text-[#c4871a]">
        <span className="w-5 h-[1.5px] bg-[#c4871a] flex-shrink-0" />
        {eyebrow}
      </div>
      <h2 className="font-heading font-black text-[clamp(40px,5.5vw,68px)] uppercase leading-[.96] text-white tracking-[-.01em]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-sm text-[#8a8a8a] max-w-[480px]">{description}</p>
      )}
    </div>
  );
}
