"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

export type MenuItemOption = {
  id: string;
  name: string;
  price: string;
  category: string;
  outOfStock: boolean;
};

export type CartLine = { menuItemId: string; quantity: number };

export function MenuItemPicker({
  menuItems,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  menuItems: MenuItemOption[];
  /** Return false (or throw) to keep the cart as-is - e.g. when the
   * caller's own validation rejects the submission. Any other return
   * value is treated as success and clears the cart. */
  onSubmit: (items: CartLine[]) => boolean | void | Promise<boolean | void>;
  submitLabel: string;
  isSubmitting?: boolean;
}) {
  const [cart, setCart] = useState<Record<string, number>>({});

  const grouped = menuItems.reduce<Record<string, MenuItemOption[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  const cartLines: CartLine[] = Object.entries(cart).map(([menuItemId, quantity]) => ({
    menuItemId,
    quantity,
  }));

  const total = cartLines.reduce((sum, line) => {
    const item = menuItems.find((m) => m.id === line.menuItemId);
    return sum + (item ? Number(item.price) * line.quantity : 0);
  }, 0);

  async function handleSubmit() {
    if (cartLines.length === 0) return;
    const result = await onSubmit(cartLines);
    if (result !== false) setCart({});
  }

  if (menuItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active menu items yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold mb-2">{category}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const qty = cart[item.id] ?? 0;
              const selected = qty > 0;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-3 transition-colors",
                    selected
                      ? "border-chart-1 bg-chart-1/10"
                      : "border-border bg-card"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">
                        {item.price}
                      </span>
                      {item.outOfStock && (
                        <Badge variant="destructive">Out of stock</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQty(item.id, qty - 1)}
                      disabled={!qty}
                    >
                      -
                    </Button>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected && "text-chart-1"
                      )}
                    >
                      {qty}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQty(item.id, qty + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm text-muted-foreground">
          Total: {total.toFixed(2)}
        </span>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={cartLines.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
