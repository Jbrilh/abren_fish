"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { InventoryItem } from "@/generated/prisma/client";

export function InventoryItemDialog({
  trigger,
  onCreated,
}: {
  trigger: React.ReactElement;
  onCreated: (item: InventoryItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          unit: formData.get("unit"),
          stockQty: formData.get("stockQty"),
          lowStockThreshold: formData.get("lowStockThreshold"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error?.formErrors?.[0] ?? "Failed to create ingredient");
        return;
      }

      const item: InventoryItem = await res.json();
      toast.success(`Added "${item.name}" to inventory`);
      onCreated(item);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form action={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New ingredient</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="inv-name">Name</Label>
            <Input id="inv-name" name="name" required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-unit">Unit</Label>
            <Input id="inv-unit" name="unit" placeholder="g, ml, piece" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-stock">Starting stock</Label>
              <Input
                id="inv-stock"
                name="stockQty"
                type="number"
                step="any"
                min="0"
                defaultValue="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-threshold">Low-stock threshold</Label>
              <Input
                id="inv-threshold"
                name="lowStockThreshold"
                type="number"
                step="any"
                min="0"
                defaultValue="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add ingredient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
