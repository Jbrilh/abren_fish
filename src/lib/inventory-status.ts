import type { Prisma } from "@/generated/prisma/client";

type RecipeWithStock = Prisma.RecipeItemGetPayload<{
  include: { inventoryItem: true };
}>;

export function isOutOfStock(recipeItems: RecipeWithStock[]): boolean {
  return recipeItems.some(
    (r) => r.inventoryItem.stockQty.toNumber() < r.quantityNeeded.toNumber()
  );
}
