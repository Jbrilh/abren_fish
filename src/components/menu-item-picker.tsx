"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  onSubmit: (items: CartLine[]) => void | Promise<void>;
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
    await onSubmit(cartLines);
    setCart({});
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
          <h3 className="text-sm font-semibold mb-1.5">{category}</h3>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-1.5 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.outOfStock && (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {item.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setQty(item.id, (cart[item.id] ?? 0) - 1)}
                    disabled={!cart[item.id]}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center text-sm">
                    {cart[item.id] ?? 0}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setQty(item.id, (cart[item.id] ?? 0) + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
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
