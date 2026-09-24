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

function toSerialized(item: InventoryItem): SerializedInventoryItem {
  return {
    ...item,
    stockQty: item.stockQty.toString(),
    lowStockThreshold: item.lowStockThreshold.toString(),
  };
}

export function InventoryList({
  initialItems,
}: {
  initialItems: SerializedInventoryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const lowStockCount = items.filter(
    (item) => Number(item.stockQty) <= Number(item.lowStockThreshold)
  ).length;

  return (
    <div className="space-y-4">
      {lowStockCount > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {lowStockCount} ingredient{lowStockCount === 1 ? "" : "s"} low on
          stock
        </div>
      )}

      <div className="flex justify-end">
        <InventoryItemDialog
          trigger={<Button>New ingredient</Button>}
          onSaved={(item) =>
            setItems((prev) =>
              [...prev, toSerialized(item)].sort((a, b) =>
                a.name.localeCompare(b.name)
              )
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
                  <TableCell className="text-right">
                    <InventoryItemDialog
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                      item={item}
                      onSaved={(saved) =>
                        setItems((prev) =>
                          prev
                            .map((i) => (i.id === saved.id ? toSerialized(saved) : i))
                            .sort((a, b) => a.name.localeCompare(b.name))
                        )
                      }
                    />
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
