import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function applyInventoryDelta(
  tx: Tx,
  items: { menuItemId: string; quantity: number }[],
  direction: 1 | -1
) {
  const menuItems = await tx.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
    include: { recipeItems: true },
  });
  const menuItemById = new Map(menuItems.map((m) => [m.id, m]));

  const deltaByInventoryId = new Map<string, number>();
  for (const item of items) {
    const menuItem = menuItemById.get(item.menuItemId);
    if (!menuItem) continue;
    for (const recipe of menuItem.recipeItems) {
      const needed = recipe.quantityNeeded.toNumber() * item.quantity * direction;
      deltaByInventoryId.set(
        recipe.inventoryItemId,
        (deltaByInventoryId.get(recipe.inventoryItemId) ?? 0) + needed
      );
    }
  }

  for (const [inventoryItemId, delta] of deltaByInventoryId) {
    await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { stockQty: { decrement: delta } },
    });
  }
}

export function computeOrderTotal(
  items: { priceAtOrder: Prisma.Decimal | string; quantity: number }[]
) {
  return items.reduce(
    (sum, item) => sum + Number(item.priceAtOrder) * item.quantity,
    0
  );
}

export const NON_CANCELLABLE_STATUSES = ["PAID", "SERVED", "CANCELLED"];
