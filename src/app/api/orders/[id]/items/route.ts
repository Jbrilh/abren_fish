import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { addItemsSchema } from "@/lib/validations/order";
import { applyInventoryDelta } from "@/lib/order-service";

const LOCKED_STATUSES = ["PAID", "SERVED", "CANCELLED"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = addItemsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });
  if (LOCKED_STATUSES.includes(order.status)) {
    return Response.json(
      { error: "This order can no longer be changed." },
      { status: 409 }
    );
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: parsed.data.items.map((i) => i.menuItemId) } },
  });
  const priceById = new Map(menuItems.map((m) => [m.id, m.price]));

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderItem.createMany({
      data: parsed.data.items.map((item) => ({
        orderId: id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        priceAtOrder: priceById.get(item.menuItemId) ?? 0,
      })),
    });

    await applyInventoryDelta(tx, parsed.data.items, 1);

    if (order.status === "OPEN") {
      await tx.order.update({
        where: { id },
        data: { status: "SENT_TO_KITCHEN", sentToKitchenAt: new Date() },
      });
    }

    return tx.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true }, orderBy: { createdAt: "asc" } },
        customer: true,
      },
    });
  });

  return Response.json(updated, { status: 201 });
}
