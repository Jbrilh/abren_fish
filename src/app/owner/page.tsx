import Link from "next/link";
import {
  PackageX,
  TriangleAlert,
  UtensilsCrossed,
  Package,
  ClipboardList,
  Wallet,
  CalendarDays,
  BarChart3,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isOutOfStock } from "@/lib/inventory-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

const QUICK_LINKS = [
  { href: "/owner/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/owner/inventory", label: "Inventory", icon: Package },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/customers", label: "Due list", icon: Wallet },
  { href: "/reconciliation", label: "Reconciliation", icon: CalendarDays },
  { href: "/owner/reports", label: "Reports", icon: BarChart3 },
  { href: "/owner/pnl", label: "P&L", icon: TrendingUp },
  { href: "/owner/personal", label: "Personal", icon: CircleDollarSign },
];

export default async function OwnerPage() {
  const [inventoryItems, menuItems] = await Promise.all([
    prisma.inventoryItem.findMany(),
    prisma.menuItem.findMany({
      where: { isActive: true },
      include: { recipeItems: { include: { inventoryItem: true } } },
    }),
  ]);

  const lowStockCount = inventoryItems.filter(
    (item) => item.stockQty.toNumber() <= item.lowStockThreshold.toNumber()
  ).length;

  const outOfStockCount = menuItems.filter(
    (item) => item.recipeItems.length > 0 && isOutOfStock(item.recipeItems)
  ).length;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Owner Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A quick look at what needs attention, and everywhere else you might
          need to go.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-xl sm:grid-cols-2">
        <Link href="/owner/inventory">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-1">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  lowStockCount > 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <TriangleAlert className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">
                  Low-stock ingredients
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/owner/inventory">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 pt-1">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  outOfStockCount > 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <PackageX className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{outOfStockCount}</p>
                <p className="text-sm text-muted-foreground">
                  Menu items out of stock
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Quick links
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 max-w-4xl">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-4.5" />
                    </div>
                    <CardTitle className="text-sm">{link.label}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
