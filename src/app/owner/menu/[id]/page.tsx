import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "../menu-item-form";

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [menuItem, inventoryItems] = await Promise.all([
    prisma.menuItem.findUnique({
      where: { id },
      include: { recipeItems: true },
    }),
    prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true },
    }),
  ]);

  if (!menuItem) notFound();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Edit menu item</h1>
      <MenuItemForm
        mode="edit"
        menuItem={{
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price.toString(),
          category: menuItem.category,
          isActive: menuItem.isActive,
        }}
        initialRecipe={menuItem.recipeItems.map((r) => ({
          inventoryItemId: r.inventoryItemId,
          quantityNeeded: r.quantityNeeded.toString(),
        }))}
        inventoryItems={inventoryItems}
      />
    </div>
  );
}
