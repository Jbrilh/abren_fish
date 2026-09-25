"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItemDialog } from "@/components/inventory-item-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import type { InventoryItem } from "@/generated/prisma/client";

type InventoryOption = Pick<InventoryItem, "id" | "name" | "unit">;

type RecipeRow = {
  key: string;
  inventoryItemId: string;
  quantityNeeded: string;
};

export function MenuItemForm({
  mode,
  menuItem,
  initialRecipe,
  inventoryItems,
}: {
  mode: "create" | "edit";
  menuItem?: { id: string; name: string; price: string; category: string; isActive: boolean };
  initialRecipe?: { inventoryItemId: string; quantityNeeded: string }[];
  inventoryItems: InventoryOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState(menuItem?.name ?? "");
  const [price, setPrice] = useState(menuItem?.price ?? "");
  const [category, setCategory] = useState(menuItem?.category ?? "");
  const [isActive, setIsActive] = useState(menuItem?.isActive ?? true);
  const [availableInventory, setAvailableInventory] = useState(inventoryItems);
  const [recipeRows, setRecipeRows] = useState<RecipeRow[]>(
    (initialRecipe ?? []).map((r, i) => ({ key: `existing-${i}`, ...r }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function addRecipeRow(inventoryItemId?: string) {
    setRecipeRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        inventoryItemId: inventoryItemId ?? "",
        quantityNeeded: "",
      },
    ]);
  }

  function updateRow(key: string, patch: Partial<RecipeRow>) {
    setRecipeRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function removeRow(key: string) {
    setRecipeRows((prev) => prev.filter((row) => row.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const incompleteRow = recipeRows.some(
      (row) => !row.inventoryItemId || !row.quantityNeeded
    );
    if (incompleteRow) {
      toast.error("Every ingredient row needs an ingredient and a quantity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { name, price, category, isActive };
      const res = await fetch(
        mode === "create" ? "/api/menu-items" : `/api/menu-items/${menuItem!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to save menu item"));
        return;
      }

      const saved = await res.json();
      const menuItemId = saved.id as string;

      const recipeRes = await fetch(`/api/menu-items/${menuItemId}/recipe`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: recipeRows.map((row) => ({
            inventoryItemId: row.inventoryItemId,
            quantityNeeded: row.quantityNeeded,
          })),
        }),
      });

      if (!recipeRes.ok) {
        toast.error("Menu item saved, but the recipe failed to save.");
        return;
      }

      toast.success(mode === "create" ? "Menu item created" : "Menu item updated");
      router.push("/owner/menu");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!menuItem) return;
    if (!confirm(`Delete "${menuItem.name}"? This can't be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu-items/${menuItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(extractErrorMessage(body, "Failed to delete menu item"));
        return;
      }
      toast.success("Menu item deleted");
      router.push("/owner/menu");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="any"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Grilled"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Active (visible for ordering)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recipeRows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No ingredients yet. Add ingredients below to enable inventory
              deduction and out-of-stock detection.
            </p>
          )}
          {recipeRows.map((row) => {
            const ingredient = availableInventory.find(
              (i) => i.id === row.inventoryItemId
            );
            return (
              <div key={row.key} className="flex items-center gap-2">
                <Select
                  value={row.inventoryItemId}
                  onValueChange={(value) =>
                    updateRow(row.key, { inventoryItemId: value ?? "" })
                  }
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInventory.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Qty needed"
                  className="w-32"
                  value={row.quantityNeeded}
                  onChange={(e) =>
                    updateRow(row.key, { quantityNeeded: e.target.value })
                  }
                />
                <span className="text-sm text-muted-foreground w-12">
                  {ingredient?.unit ?? ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRow(row.key)}
                >
                  <XIcon />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            );
          })}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addRecipeRow()}
              disabled={availableInventory.length === 0}
            >
              + Add ingredient
            </Button>
            <InventoryItemDialog
              trigger={
                <Button type="button" variant="outline" size="sm">
                  + New ingredient
                </Button>
              }
              onSaved={(item) => {
                setAvailableInventory((prev) => [...prev, item]);
                addRecipeRow(item.id);
              }}
            />
          </div>
          {availableInventory.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No ingredients in inventory yet - create one to build a recipe.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create item" : "Save changes"}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete item"}
          </Button>
        )}
      </div>
    </form>
  );
}
