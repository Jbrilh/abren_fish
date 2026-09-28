"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuItemPicker, type CartLine, type MenuItemOption } from "@/components/menu-item-picker";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CBE", label: "CBE" },
  { value: "TELEBIRR", label: "Telebirr" },
  { value: "HALF_HALF", label: "Half / half" },
  { value: "DUE", label: "Due (customer tab)" },
];

const LOCKED_STATUSES = ["PAID", "SERVED", "CANCELLED"];
const CANCELLABLE_STATUSES = ["OPEN", "SENT_TO_KITCHEN"];

type OrderItem = {
  id: string;
  menuItemName: string;
  quantity: number;
  status: string;
  priceAtOrder: string;
};

type Order = {
  id: string;
  type: string;
  ticketNumber: string | null;
  tableNumber: string | null;
  status: string;
  paymentMethod: string | null;
  createdByName: string;
  customerName: string | null;
  customerPhone: string | null;
  items: OrderItem[];
};

export function OrderDetail({
  order,
  menuItems,
}: {
  order: Order;
  menuItems: MenuItemOption[];
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [dueCustomerName, setDueCustomerName] = useState("");
  const [dueCustomerPhone, setDueCustomerPhone] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Order", filter: `id=eq.${order.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "OrderItem", filter: `orderId=eq.${order.id}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, router]);

  const locked = LOCKED_STATUSES.includes(order.status);
  const cancellable = CANCELLABLE_STATUSES.includes(order.status);
  const readyForCheckout = order.status === "SERVED";
  const hasCustomer = !!order.customerName;
  const total = order.items.reduce(
    (sum, item) => sum + Number(item.priceAtOrder) * item.quantity,
    0
  );

  async function handleAddItems(items: CartLine[]) {
    setIsAdding(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to add items"));
        return;
      }
      toast.success("Items added");
      router.refresh();
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setRemovingId(itemId);
    try {
      const res = await fetch(`/api/orders/${order.id}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to remove item"));
        return;
      }
      toast.success("Item removed");
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  async function handleCancelOrder() {
    if (!confirm("Cancel this order? Any deducted stock will be restored.")) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to cancel order"));
        return;
      }
      toast.success("Order cancelled");
      router.refresh();
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleCheckout() {
    if (!paymentMethod) {
      toast.error("Select a payment method.");
      return;
    }
    if (paymentMethod === "DUE" && !hasCustomer && (!dueCustomerName.trim() || !dueCustomerPhone.trim())) {
      toast.error("Customer name and phone are required for a due tab.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          customerName:
            paymentMethod === "DUE" && !hasCustomer ? dueCustomerName : undefined,
          customerPhone:
            paymentMethod === "DUE" && !hasCustomer ? dueCustomerPhone : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Checkout failed"));
        return;
      }
      toast.success("Payment recorded");
      router.refresh();
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {order.type === "DINE_IN"
              ? `Ticket ${order.ticketNumber ?? "-"}${
                  order.tableNumber ? ` (Table ${order.tableNumber})` : ""
                }`
              : `${order.customerName} (${order.customerPhone})`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created by {order.createdByName}
          </p>
        </div>
        <div className="text-right">
          <Badge>{order.status.replaceAll("_", " ")}</Badge>
          {order.paymentMethod && (
            <p className="text-xs text-muted-foreground mt-1">
              Paid via {order.paymentMethod.replaceAll("_", " ")}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.menuItemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {(Number(item.priceAtOrder) * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "SERVED" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!locked && item.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={removingId === item.id}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          {removingId === item.id ? "Removing..." : "Remove"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="text-sm text-muted-foreground text-right mt-3">
            Total: {total.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {readyForCheckout && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "")}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "DUE" && !hasCustomer && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dueName">Customer name</Label>
                  <Input
                    id="dueName"
                    value={dueCustomerName}
                    onChange={(e) => setDueCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duePhone">Phone</Label>
                  <Input
                    id="duePhone"
                    value={dueCustomerPhone}
                    onChange={(e) => setDueCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? "Processing..." : "Complete payment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {!locked && (
        <Card>
          <CardHeader>
            <CardTitle>Add items</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuItemPicker
              menuItems={menuItems}
              onSubmit={handleAddItems}
              submitLabel="Add to order"
              isSubmitting={isAdding}
            />
          </CardContent>
        </Card>
      )}

      {cancellable && (
        <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
          {isCancelling ? "Cancelling..." : "Cancel order"}
        </Button>
      )}
    </div>
  );
}
