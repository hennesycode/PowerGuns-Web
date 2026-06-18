import { cn } from "@/lib/utils";
import Link from "next/link";

interface TacticalButtonProps {
  href?: string;
  variant?: "primary" | "outline" | "dark" | "full";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

export function TacticalButton({
  href,
  variant = "primary",
  children,
  className,
  type = "button",
  onClick,
}: TacticalButtonProps) {
  const base =
    "font-heading font-bold text-sm md:text-[15px] tracking-[.14em] uppercase no-underline inline-block cursor-pointer border-none transition-all duration-200 text-center";

  const variants = {
    primary:
      "bg-[#c4871a] text-[#080808] px-8 md:px-10 py-4 tactical-clip-lg hover:bg-[#d4a244] hover:-translate-y-0.5",
    outline:
      "bg-transparent text-[#c8c8c8] border border-[#c4871a]/40 px-8 md:px-10 py-4 tactical-clip-lg hover:border-[#c4871a] hover:text-[#c4871a] hover:bg-[#c4871a]/7",
    dark: "bg-[#080808] text-[#c4871a] px-8 md:px-10 py-4 tactical-clip-lg hover:bg-[#191919]",
    full: "w-full block px-4 py-3.5 text-sm",
  };

  const Comp = href ? Link : "button";

  return (
    <Comp
      href={href as string}
      type={href ? undefined : type}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </Comp>
  );
}
