"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, LayoutGrid, ClipboardList, Wallet, CalendarDays } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "cn";

const LINKS = [
  { href: "/orders", label: "Orders", icon: ClipboardList, roles: ["OWNER", "WAITER"] },
  { href: "/customers", label: "Due list", icon: Wallet, roles: ["OWNER"] },
  { href: "/reconciliation", label: "Reconciliation", icon: CalendarDays, roles: ["OWNER"] },
];

export function StaffNav({
  homeHref,
  userName,
  role,
}: {
  homeHref: string;
  userName: string | null | undefined;
  role: string | undefined;
}) {
  const pathname = usePathname();
  const links = LINKS.filter((link) => !role || link.roles.includes(role));

  return (
    <header className="bg-primary text-primary-foreground shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href={homeHref} className="flex items-center gap-2 font-heading font-semibold">
            <Fish className="size-5" />
            <span>Abren Fish</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href={homeHref}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground/75 transition-colors hover:bg-white/10 hover:text-primary-foreground",
                pathname === homeHref && "bg-white/15 text-primary-foreground"
              )}
            >
              <LayoutGrid className="size-4" />
              Dashboard
            </Link>
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary-foreground/75 transition-colors hover:bg-white/10 hover:text-primary-foreground",
                    active && "bg-white/15 text-primary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary-foreground/80">{userName}</span>
          <SignOutButton className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" />
        </div>
      </div>
    </header>
  );
}
