import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOutOfStock } from "@/lib/inventory-status";
import { OrderDetail } from "./order-detail";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, menuItems] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true }, orderBy: { createdAt: "asc" } },
        customer: true,
        createdBy: { select: { name: true } },
      },
    }),
    prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: { recipeItems: { include: { inventoryItem: true } } },
    }),
  ]);

  if (!order) notFound();

  const menuItemOptions = menuItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price.toString(),
    category: item.category,
    outOfStock: item.recipeItems.length > 0 && isOutOfStock(item.recipeItems),
  }));

  return (
    <div className="p-6 max-w-2xl">
      <OrderDetail
        order={{
          id: order.id,
          type: order.type,
          ticketNumber: order.ticketNumber,
          tableNumber: order.tableNumber,
          status: order.status,
          paymentMethod: order.paymentMethod,
          createdByName: order.createdBy.name,
          customerName: order.customer?.name ?? null,
          customerPhone: order.customer?.phone ?? null,
          items: order.items.map((item) => ({
            id: item.id,
            menuItemName: item.menuItem.name,
            quantity: item.quantity,
            status: item.status,
            priceAtOrder: item.priceAtOrder.toString(),
          })),
        }}
        menuItems={menuItemOptions}
      />
    </div>
  );
}
