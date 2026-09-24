import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { applyInventoryDelta } from "@/lib/order-service";

const LOCKED_STATUSES = ["PAID", "SERVED", "CANCELLED"];

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { error } = await requireUser(["OWNER", "WAITER"]);
  if (error) return error;

  const { id, itemId } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (LOCKED_STATUSES.includes(order.status)) {
    return Response.json(
      { error: "This order can no longer be changed." },
      { status: 409 }
    );
  }

  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== id) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }
  if (item.status === "SERVED") {
    return Response.json(
      { error: "Can't remove an item that's already been served." },
      { status: 409 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.delete({ where: { id: itemId } });
    await applyInventoryDelta(
      tx,
      [{ menuItemId: item.menuItemId, quantity: item.quantity }],
      -1
    );
  });

  return new Response(null, { status: 204 });
}
