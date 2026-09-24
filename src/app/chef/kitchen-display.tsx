"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    const res = await fetch(`/api/orders/${orderId}/items/${itemId}/serve`, {
      method: "POST",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Failed to mark served");
      return;
    }
    fetchOrders();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  const activeOrders = orders.filter((o) => o.items.length > 0);

  if (activeOrders.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">No pending orders.</p>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle>
              {order.type === "DINE_IN"
                ? `Ticket ${order.ticketNumber ?? "-"}${
                    order.tableNumber ? ` · Table ${order.tableNumber}` : ""
                  }`
                : `Delivery · ${order.customerName ?? "-"}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="text-sm">
                  {item.quantity}x {item.menuItemName}
                </span>
                <Button size="sm" onClick={() => markServed(order.id, item.id)}>
                  Served
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
