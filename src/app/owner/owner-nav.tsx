"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  UtensilsCrossed,
  Package,
  ClipboardList,
  Wallet,
  CalendarDays,
  BarChart3,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/owner", label: "Dashboard", icon: LayoutGrid, exact: true },
  { href: "/owner/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/owner/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/customers", label: "Due list", icon: Wallet },
  { href: "/reconciliation", label: "Reconciliation", icon: CalendarDays },
  { href: "/owner/reports", label: "Reports", icon: BarChart3 },
  { href: "/owner/pnl", label: "P&L", icon: TrendingUp },
  { href: "/owner/personal", label: "Personal", icon: CircleDollarSign },
];

export function OwnerNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 px-6 pb-3">
      {NAV_LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary-foreground/75 transition-colors hover:bg-white/10 hover:text-primary-foreground",
              active && "bg-white/15 text-primary-foreground"
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
