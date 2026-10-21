"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { TAKEAWAY_BOX_FEE } from "@/lib/order-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItemPicker, type CartLine, type MenuItemOption } from "@/components/menu-item-picker";

export function NewOrderForm({ menuItems }: { menuItems: MenuItemOption[] }) {
  const router = useRouter();
  const [type, setType] = useState<"DINE_IN" | "DELIVERY" | "BEU_DELIVERY">("DINE_IN");
  const [ticketNumber, setTicketNumber] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePlaceOrder(items: CartLine[]) {
    if (type === "DINE_IN" && !ticketNumber.trim()) {
      toast.error("Ticket number is required for dine-in orders.");
      return false;
    }
    if (type === "DELIVERY" && (!customerName.trim() || !customerPhone.trim())) {
      toast.error("Customer name and phone are required for delivery orders.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ticketNumber: type === "DINE_IN" ? ticketNumber : undefined,
          tableNumber: type === "DINE_IN" ? tableNumber || undefined : undefined,
          customerName: type === "DELIVERY" ? customerName : undefined,
          customerPhone: type === "DELIVERY" ? customerPhone : undefined,
          items,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to create order"));
        return false;
      }

      const order = await res.json();
      toast.success("Order placed");
      router.push(`/orders/${order.id}`);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "DINE_IN" ? "default" : "outline"}
              onClick={() => setType("DINE_IN")}
            >
              Dine-in
            </Button>
            <Button
              type="button"
              variant={type === "DELIVERY" ? "default" : "outline"}
              onClick={() => setType("DELIVERY")}
            >
              Delivery
            </Button>
            <Button
              type="button"
              variant={type === "BEU_DELIVERY" ? "default" : "outline"}
              onClick={() => setType("BEU_DELIVERY")}
            >
              Beu Delivery
            </Button>
          </div>

          {type === "BEU_DELIVERY" ? (
            <p className="text-sm text-muted-foreground">
              No customer details needed - this order will be added to the Beu
              Delivery due balance, to be collected later.
            </p>
          ) : type === "DINE_IN" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ticket">Ticket #</Label>
                <Input
                  id="ticket"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table">Table # (optional)</Label>
                <Input
                  id="table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemPicker
            menuItems={menuItems}
            onSubmit={handlePlaceOrder}
            submitLabel="Place order"
            isSubmitting={isSubmitting}
            extraFee={
              type === "DELIVERY" || type === "BEU_DELIVERY"
                ? TAKEAWAY_BOX_FEE
                : undefined
            }
            extraFeeLabel="Takeaway boxes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
