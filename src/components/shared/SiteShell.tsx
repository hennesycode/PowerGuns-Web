import type { ElementType } from "react";
import { cn } from "@/lib/utils";

interface SiteShellProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

export function SiteShell({ children, className, as: Tag = "div" }: SiteShellProps) {
  return (
    <Tag className={cn("w-full max-w-[1280px] mx-auto px-6 md:px-10 lg:px-12", className)}>
      {children}
    </Tag>
  );
}
