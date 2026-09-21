"use client";

import { useState } from "react";
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
import { InventoryItemDialog } from "@/components/inventory-item-dialog";
import type { InventoryItem } from "@/generated/prisma/client";

type SerializedInventoryItem = Omit<
  InventoryItem,
  "stockQty" | "lowStockThreshold"
> & {
  stockQty: string;
  lowStockThreshold: string;
};

export function InventoryList({
  initialItems,
}: {
  initialItems: SerializedInventoryItem[];
}) {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <InventoryItemDialog
          trigger={<Button>New ingredient</Button>}
          onCreated={(item) =>
            setItems((prev) =>
              [
                ...prev,
                {
                  ...item,
                  stockQty: item.stockQty.toString(),
                  lowStockThreshold: item.lowStockThreshold.toString(),
                },
              ].sort((a, b) => a.name.localeCompare(b.name))
            )
          }
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No ingredients yet. Add one to start building recipes.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Low-stock threshold</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const low = Number(item.stockQty) <= Number(item.lowStockThreshold);
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.stockQty}</TableCell>
                  <TableCell>{item.lowStockThreshold}</TableCell>
                  <TableCell>
                    {low && <Badge variant="destructive">Low stock</Badge>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
