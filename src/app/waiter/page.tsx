import Link from "next/link";
import { Fish, PlusCircle, UtensilsCrossed, Truck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { computeOrderTotal } from "@/lib/order-service";
import { cn } from "cn";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  OPEN: "secondary",
  SENT_TO_KITCHEN: "default",
  SERVED: "default",
  PAID: "secondary",
  CANCELLED: "destructive",
};

export default async function WaiterPage() {
  const [session, orders] = await Promise.all([
    auth(),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2 font-heading font-semibold">
            <Fish className="size-5 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Abren Fish</span>
              <span className="font-normal text-primary-foreground/60">
                {" "}
                · Waiter
              </span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-primary-foreground/80 sm:inline">
              {session?.user?.name}
            </span>
            <SignOutButton className="border-white/30 bg-transparent px-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground sm:px-3" />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/40 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-heading text-lg font-semibold">Orders</h1>
          <Button render={<Link href="/orders/new" />} className="gap-1.5">
            <PlusCircle className="size-4" />
            New order
          </Button>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
              const isDineIn = order.type === "DINE_IN";
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="flex items-start gap-3 pt-1">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          isDineIn
                            ? "bg-chart-1/10 text-chart-1"
                            : "bg-chart-2/10 text-chart-2"
                        )}
                      >
                        {isDineIn ? (
                          <UtensilsCrossed className="size-4.5" />
                        ) : (
                          <Truck className="size-4.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium">
                            {isDineIn
                              ? `Ticket ${order.ticketNumber ?? "-"}${
                                  order.tableNumber
                                    ? ` · Table ${order.tableNumber}`
                                    : ""
                                }`
                              : order.customer?.name ?? "Delivery"}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">
                            {order.items.length} item
                            {order.items.length === 1 ? "" : "s"} ·{" "}
                            {computeOrderTotal(order.items).toFixed(2)}
                          </span>
                          <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                            {order.status.replaceAll("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
