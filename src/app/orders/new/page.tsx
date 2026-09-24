import { prisma } from "@/lib/prisma";
import { isOutOfStock } from "@/lib/inventory-status";
import { NewOrderForm } from "./new-order-form";

export default async function NewOrderPage() {
  const menuItems = await prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: { recipeItems: { include: { inventoryItem: true } } },
  });

  const options = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price.toString(),
    category: item.category,
    outOfStock: item.recipeItems.length > 0 && isOutOfStock(item.recipeItems),
  }));

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6">New order</h1>
      <NewOrderForm menuItems={options} />
    </div>
  );
}
