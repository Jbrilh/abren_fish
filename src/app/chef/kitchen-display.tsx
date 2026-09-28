"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { UtensilsCrossed, Truck, Check, ChefHat } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "cn";

type OrderItem = {
  id: string;
  menuItemName: string;
  quantity: number;
};

type KitchenOrder = {
  id: string;
  type: string;
  ticketNumber: string | null;
  tableNumber: string | null;
  customerName: string | null;
  items: OrderItem[];
};

type ApiOrderItem = {
  id: string;
  status: string;
  quantity: number;
  menuItem: { name: string };
};

type ApiOrder = {
  id: string;
  type: string;
  ticketNumber: string | null;
  tableNumber: string | null;
  customer: { name: string } | null;
  items: ApiOrderItem[];
};

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [servingId, setServingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders?status=SENT_TO_KITCHEN");
    if (res.ok) {
      const data: ApiOrder[] = await res.json();
      setOrders(
        data.map((o) => ({
          id: o.id,
          type: o.type,
          ticketNumber: o.ticketNumber,
          tableNumber: o.tableNumber,
          customerName: o.customer?.name ?? null,
          items: o.items
            .filter((i) => i.status === "PENDING")
            .map((i) => ({
              id: i.id,
              menuItemName: i.menuItem.name,
              quantity: i.quantity,
            })),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load alongside the realtime subscription below
    fetchOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order" },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "OrderItem" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  async function markServed(orderId: string, itemId: string) {
    setServingId(itemId);
    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}/serve`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to mark served"));
        return;
      }
      fetchOrders();
    } finally {
      setServingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.items.length > 0);

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <ChefHat className="size-8" />
        </div>
        <div>
          <p className="font-medium">All caught up</p>
          <p className="text-sm text-muted-foreground">
            No pending orders right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeOrders.map((order) => {
        const isDineIn = order.type === "DINE_IN";
        return (
          <Card
            key={order.id}
            className={cn(
              "border-t-4",
              isDineIn ? "border-t-chart-1" : "border-t-chart-2"
            )}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    isDineIn
                      ? "bg-chart-1/10 text-chart-1"
                      : "bg-chart-2/10 text-chart-2"
                  )}
                >
                  {isDineIn ? (
                    <UtensilsCrossed className="size-4" />
                  ) : (
                    <Truck className="size-4" />
                  )}
                </div>
                <span className="font-heading text-base font-semibold">
                  {isDineIn
                    ? `Ticket ${order.ticketNumber ?? "-"}`
                    : order.customerName ?? "Delivery"}
                </span>
              </div>
              {isDineIn && order.tableNumber && (
                <Badge variant="secondary">Table {order.tableNumber}</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-1.5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60"
                >
                  <span className="text-sm">
                    <span className="font-semibold">{item.quantity}×</span>{" "}
                    {item.menuItemName}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={servingId === item.id}
                    onClick={() => markServed(order.id, item.id)}
                  >
                    <Check className="size-3.5" />
                    {servingId === item.id ? "..." : "Served"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
