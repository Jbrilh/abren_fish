"use client";

import { useState } from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/extract-error-message";
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

type EditableItem = {
  id: string;
  name: string;
  unit: string;
  stockQty: string;
  lowStockThreshold: string;
};

export function InventoryItemDialog({
  trigger,
  item,
  onSaved,
}: {
  trigger: React.ReactElement;
  item?: EditableItem;
  onSaved: (item: InventoryItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!item;

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        isEdit ? `/api/inventory-items/${item!.id}` : "/api/inventory-items",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.get("name"),
            unit: formData.get("unit"),
            stockQty: formData.get("stockQty"),
            lowStockThreshold: formData.get("lowStockThreshold"),
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(
          extractErrorMessage(body, `Failed to ${isEdit ? "save" : "create"} ingredient`)
        );
        return;
      }

      const saved: InventoryItem = await res.json();
      toast.success(isEdit ? `Updated "${saved.name}"` : `Added "${saved.name}" to inventory`);
      onSaved(saved);
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
            <DialogTitle>{isEdit ? "Edit ingredient" : "New ingredient"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="inv-name">Name</Label>
            <Input
              id="inv-name"
              name="name"
              defaultValue={item?.name}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-unit">Unit</Label>
            <Input
              id="inv-unit"
              name="unit"
              placeholder="g, ml, piece"
              defaultValue={item?.unit}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inv-stock">
                {isEdit ? "Stock" : "Starting stock"}
              </Label>
              <Input
                id="inv-stock"
                name="stockQty"
                type="number"
                step="any"
                min="0"
                defaultValue={item?.stockQty ?? "0"}
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
                defaultValue={item?.lowStockThreshold ?? "0"}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Adding..."
                : isEdit
                  ? "Save changes"
                  : "Add ingredient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
