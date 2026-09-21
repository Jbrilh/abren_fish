import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "../menu-item-form";

export default async function NewMenuItemPage() {
  const inventoryItems = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true },
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">New menu item</h1>
      <MenuItemForm mode="create" inventoryItems={inventoryItems} />
    </div>
  );
}
