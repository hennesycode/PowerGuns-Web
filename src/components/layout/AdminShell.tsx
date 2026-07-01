"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/reservas");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
