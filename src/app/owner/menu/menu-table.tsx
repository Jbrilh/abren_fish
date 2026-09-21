"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MenuRow = {
  id: string;
  name: string;
  category: string;
  price: string;
  isActive: boolean;
  recipeItemCount: number;
};

export function MenuTable({ items }: { items: MenuRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(item: MenuRow) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/menu-items/${item.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error ?? "Failed to delete menu item");
        return;
      }
      toast.success("Menu item deleted");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No menu items yet. Create one to get started.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recipe</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.price}</TableCell>
            <TableCell>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              {item.recipeItemCount === 0 ? (
                <span className="text-muted-foreground">No recipe</span>
              ) : (
                `${item.recipeItemCount} ingredient${item.recipeItemCount === 1 ? "" : "s"}`
              )}
            </TableCell>
            <TableCell className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/owner/menu/${item.id}`} />}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item)}
              >
                {deletingId === item.id ? "Deleting..." : "Delete"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
